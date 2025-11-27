import { getHistoricalData } from "./kite";
import { strategyRegistry } from "./strategy/registry";
import { CustomStrategyExecutor } from "./strategy/custom-strategy";
import { CustomStrategy } from "./custom-strategy-storage";

interface Trade {
  date: Date;
  action: "BUY" | "SELL";
  price: number;
  quantity: number;
  value: number;
  cash_after: number;
  holdings_after: number;
  portfolio_value: number;
  indicators?: Record<string, number>;
}

interface BacktestMetrics {
  initial_capital: number;
  final_value: number;
  total_return: number;
  return_percentage: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  max_drawdown: number;
  max_drawdown_percentage: number;
  sharpe_ratio: number;
  total_fees: number;
  avg_trade_return: number;
  best_trade: number;
  worst_trade: number;
  trades: Trade[];
}

export async function runBacktest(
  instrument_token: string,
  from_date: string,
  to_date: string,
  interval: string,
  strategy_id: string = "sma_crossover",
  strategy_params: Record<string, number> = {},
  initial_capital: number = 100000,
  custom_strategy?: CustomStrategy, // Optional custom strategy definition
  position_size_percentage: number = 95, // Use 95% of available cash
  fee_percentage: number = 0.03 // 0.03% per trade (brokerage + taxes)
) {
  console.log("[BACKTEST] ========== Starting Backtest ==========");
  console.log("[BACKTEST] Parameters:");
  console.log("[BACKTEST] - Instrument Token:", instrument_token);
  console.log("[BACKTEST] - Date Range:", from_date, "to", to_date);
  console.log("[BACKTEST] - Interval:", interval);
  console.log("[BACKTEST] - Strategy:", strategy_id);
  console.log("[BACKTEST] - Strategy Params:", JSON.stringify(strategy_params));
  console.log(
    "[BACKTEST] - Initial Capital: ₹",
    initial_capital.toLocaleString()
  );
  console.log("[BACKTEST] - Position Size: ", position_size_percentage + "%");
  console.log("[BACKTEST] - Fee per trade: ", fee_percentage + "%");

  // 1. Fetch Historical Data
  console.log("[BACKTEST] Step 1: Fetching historical data...");
  const historicalData = await getHistoricalData(
    instrument_token,
    from_date,
    to_date,
    interval
  );
  console.log("[BACKTEST] Fetched", historicalData?.length || 0, "data points");

  if (!historicalData || historicalData.length === 0) {
    console.error("[BACKTEST] ERROR: No data found for the given range");
    throw new Error("No data found for the given range");
  }

  console.log("[BACKTEST] First data point:", historicalData[0]?.date);
  console.log(
    "[BACKTEST] Last data point:",
    historicalData[historicalData.length - 1]?.date
  );

  // 2. Apply Strategy
  console.log("[BACKTEST] Step 2: Applying Strategy...");

  // Get strategy - either from registry or create custom strategy executor
  let strategy;
  if (custom_strategy) {
    console.log("[BACKTEST] Using custom strategy:", custom_strategy.name);
    strategy = new CustomStrategyExecutor(custom_strategy);
  } else {
    strategy = strategyRegistry.get(strategy_id);
    if (!strategy) {
      throw new Error(`Strategy not found: ${strategy_id}`);
    }
  }

  const strategyConfig = strategy.getConfig();
  console.log("[BACKTEST] Strategy:", strategyConfig.name);

  const signals = strategy.generateSignals(historicalData, strategy_params);
  console.log("[BACKTEST] Generated", signals.length, "signals");

  // 3. Calculate Metrics with Dynamic Position Sizing
  console.log(
    "[BACKTEST] Step 3: Simulating trades and calculating metrics..."
  );

  let cash = initial_capital;
  let holdings = 0;
  let totalFees = 0;
  const trades: Trade[] = [];
  const portfolioValues: number[] = [initial_capital];
  let peakValue = initial_capital;
  let maxDrawdown = 0;

  console.log(
    "[BACKTEST] Initial Capital: ₹",
    initial_capital.toLocaleString()
  );
  console.log("[BACKTEST] Processing", signals.length, "signals...");

  for (let i = 0; i < signals.length; i++) {
    const point = signals[i];
    const price = point.close;

    // Calculate current portfolio value
    const currentPortfolioValue = cash + holdings * price;
    portfolioValues.push(currentPortfolioValue);

    // Track peak and drawdown
    if (currentPortfolioValue > peakValue) {
      peakValue = currentPortfolioValue;
    }
    const drawdown = peakValue - currentPortfolioValue;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }

    // BUY signal - Only buy if we don't have holdings (no pyramiding)
    if (point.position === 1.0 && holdings === 0) {
      // Calculate how much we can invest (use percentage of cash)
      const investmentAmount = cash * (position_size_percentage / 100);

      // Calculate quantity based on price (integer shares only)
      const quantity = Math.floor(investmentAmount / price);

      if (quantity > 0 && price > 0) {
        const cost = quantity * price;
        const fee = cost * (fee_percentage / 100);
        const totalCost = cost + fee;

        if (cash >= totalCost) {
          cash -= totalCost;
          holdings += quantity;
          totalFees += fee;

          const portfolioValueAfter = cash + holdings * price;

          trades.push({
            date: point.date,
            action: "BUY",
            price: price,
            quantity: quantity,
            value: cost,
            cash_after: cash,
            holdings_after: holdings,
            portfolio_value: portfolioValueAfter,
            indicators: point.indicators,
          });

          console.log(
            `[BACKTEST] ✅ BUY #${trades.length} at ${
              point.date.toISOString().split("T")[0]
            }`,
            `| Price: ₹${price.toFixed(2)}`,
            `| Qty: ${quantity}`,
            `| Cost: ₹${cost.toFixed(2)}`,
            `| Fee: ₹${fee.toFixed(2)}`,
            `| Cash: ₹${cash.toFixed(2)}`,
            `| Portfolio: ₹${portfolioValueAfter.toFixed(2)}`
          );
        } else {
          console.log(
            `[BACKTEST] ⚠️  BUY Signal at ${
              point.date.toISOString().split("T")[0]
            } SKIPPED`,
            `| Insufficient cash. Required: ₹${totalCost.toFixed(
              2
            )}, Available: ₹${cash.toFixed(2)}`
          );
        }
      } else {
        console.log(
          `[BACKTEST] ⚠️  BUY Signal at ${
            point.date.toISOString().split("T")[0]
          } SKIPPED`,
          `| Cannot buy (Qty: ${quantity}, Price: ₹${price})`
        );
      }
    }
    // SELL signal - Sell all holdings
    else if (point.position === -1.0 && holdings > 0) {
      const quantity = holdings;
      const revenue = quantity * price;
      const fee = revenue * (fee_percentage / 100);
      const netRevenue = revenue - fee;

      cash += netRevenue;
      holdings = 0;
      totalFees += fee;

      const portfolioValueAfter = cash + holdings * price;

      trades.push({
        date: point.date,
        action: "SELL",
        price: price,
        quantity: quantity,
        value: revenue,
        cash_after: cash,
        holdings_after: holdings,
        portfolio_value: portfolioValueAfter,
        indicators: point.indicators,
      });

      console.log(
        `[BACKTEST] ✅ SELL #${trades.length} at ${
          point.date.toISOString().split("T")[0]
        }`,
        `| Price: ₹${price.toFixed(2)}`,
        `| Qty: ${quantity}`,
        `| Revenue: ₹${revenue.toFixed(2)}`,
        `| Fee: ₹${fee.toFixed(2)}`,
        `| Cash: ₹${cash.toFixed(2)}`,
        `| Portfolio: ₹${portfolioValueAfter.toFixed(2)}`
      );
    } else if (point.position === 1.0 && holdings > 0) {
      // Already holding, skip buy signal
      console.log(
        `[BACKTEST] ℹ️  BUY Signal at ${
          point.date.toISOString().split("T")[0]
        } IGNORED`,
        `| Already holding ${holdings} shares`
      );
    } else if (point.position === -1.0 && holdings === 0) {
      // No holdings to sell
      console.log(
        `[BACKTEST] ℹ️  SELL Signal at ${
          point.date.toISOString().split("T")[0]
        } IGNORED`,
        `| No holdings to sell`
      );
    }
  }

  // Final portfolio value
  const finalPrice = signals[signals.length - 1].close;
  const holdingsValue = holdings * finalPrice;
  const finalValue = cash + holdingsValue;
  const totalReturn = finalValue - initial_capital;
  const returnPercentage = (totalReturn / initial_capital) * 100;

  // Calculate advanced metrics
  let winningTrades = 0;
  let losingTrades = 0;
  let totalTradeReturn = 0;
  let bestTrade = 0;
  let worstTrade = 0;
  const tradeReturns: number[] = [];

  // Pair buy/sell trades to calculate P&L
  for (let i = 0; i < trades.length - 1; i += 2) {
    if (trades[i].action === "BUY" && trades[i + 1]?.action === "SELL") {
      const buyValue = trades[i].value;
      const sellValue = trades[i + 1].value;
      const tradeReturn = sellValue - buyValue;
      const tradeReturnPct = (tradeReturn / buyValue) * 100;

      tradeReturns.push(tradeReturnPct);
      totalTradeReturn += tradeReturn;

      if (tradeReturn > 0) {
        winningTrades++;
      } else {
        losingTrades++;
      }

      if (tradeReturn > bestTrade) {
        bestTrade = tradeReturn;
      }
      if (tradeReturn < worstTrade) {
        worstTrade = tradeReturn;
      }
    }
  }

  const completedTrades = winningTrades + losingTrades;
  const winRate =
    completedTrades > 0 ? (winningTrades / completedTrades) * 100 : 0;
  const avgTradeReturn =
    completedTrades > 0 ? totalTradeReturn / completedTrades : 0;
  const maxDrawdownPercentage =
    peakValue > 0 ? (maxDrawdown / peakValue) * 100 : 0;

  // Calculate Sharpe Ratio (simplified - assumes daily returns)
  let sharpeRatio = 0;
  if (tradeReturns.length > 1) {
    const avgReturn =
      tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;
    const variance =
      tradeReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) /
      tradeReturns.length;
    const stdDev = Math.sqrt(variance);
    sharpeRatio = stdDev !== 0 ? avgReturn / stdDev : 0;
  }

  console.log("[BACKTEST] ========== Backtest Complete ==========");
  console.log("[BACKTEST] 📊 Performance Summary:");
  console.log(
    "[BACKTEST] - Initial Capital: ₹",
    initial_capital.toLocaleString()
  );
  console.log("[BACKTEST] - Final Value: ₹", finalValue.toFixed(2));
  console.log(
    "[BACKTEST] - Total Return: ₹",
    totalReturn.toFixed(2),
    `(${returnPercentage.toFixed(2)}%)`
  );
  console.log("[BACKTEST] - Total Fees: ₹", totalFees.toFixed(2));
  console.log("[BACKTEST] ");
  console.log("[BACKTEST] 📈 Trade Statistics:");
  console.log("[BACKTEST] - Total Trades:", trades.length);
  console.log("[BACKTEST] - Completed Trades:", completedTrades);
  console.log("[BACKTEST] - Winning Trades:", winningTrades);
  console.log("[BACKTEST] - Losing Trades:", losingTrades);
  console.log("[BACKTEST] - Win Rate:", winRate.toFixed(2) + "%");
  console.log("[BACKTEST] - Avg Trade Return: ₹", avgTradeReturn.toFixed(2));
  console.log("[BACKTEST] - Best Trade: ₹", bestTrade.toFixed(2));
  console.log("[BACKTEST] - Worst Trade: ₹", worstTrade.toFixed(2));
  console.log("[BACKTEST] ");
  console.log("[BACKTEST] 📉 Risk Metrics:");
  console.log(
    "[BACKTEST] - Max Drawdown: ₹",
    maxDrawdown.toFixed(2),
    `(${maxDrawdownPercentage.toFixed(2)}%)`
  );
  console.log("[BACKTEST] - Sharpe Ratio:", sharpeRatio.toFixed(2));
  console.log("[BACKTEST] ");
  console.log("[BACKTEST] 💼 Final Position:");
  console.log("[BACKTEST] - Cash: ₹", cash.toFixed(2));
  console.log(
    "[BACKTEST] - Holdings:",
    holdings,
    "shares @ ₹" + finalPrice.toFixed(2)
  );
  console.log("[BACKTEST] - Holdings Value: ₹", holdingsValue.toFixed(2));
  console.log("[BACKTEST] ===========================================");

  const metrics: BacktestMetrics = {
    initial_capital: initial_capital,
    final_value: parseFloat(finalValue.toFixed(2)),
    total_return: parseFloat(totalReturn.toFixed(2)),
    return_percentage: parseFloat(returnPercentage.toFixed(2)),
    total_trades: trades.length,
    winning_trades: winningTrades,
    losing_trades: losingTrades,
    win_rate: parseFloat(winRate.toFixed(2)),
    max_drawdown: parseFloat(maxDrawdown.toFixed(2)),
    max_drawdown_percentage: parseFloat(maxDrawdownPercentage.toFixed(2)),
    sharpe_ratio: parseFloat(sharpeRatio.toFixed(2)),
    total_fees: parseFloat(totalFees.toFixed(2)),
    avg_trade_return: parseFloat(avgTradeReturn.toFixed(2)),
    best_trade: parseFloat(bestTrade.toFixed(2)),
    worst_trade: parseFloat(worstTrade.toFixed(2)),
    trades: trades,
  };

  return metrics;
}
