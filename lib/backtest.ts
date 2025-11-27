import { getHistoricalData } from "./kite";
import { SMACrossoverStrategy } from "./strategy/sma";

export async function runBacktest(
  instrument_token: string,
  from_date: string,
  to_date: string,
  interval: string,
  short_window: number,
  long_window: number
) {
  console.log("[BACKTEST] ========== Starting Backtest ==========");
  console.log("[BACKTEST] Parameters:");
  console.log("[BACKTEST] - Instrument Token:", instrument_token);
  console.log("[BACKTEST] - Date Range:", from_date, "to", to_date);
  console.log("[BACKTEST] - Interval:", interval);
  console.log("[BACKTEST] - Short Window:", short_window);
  console.log("[BACKTEST] - Long Window:", long_window);

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
  console.log("[BACKTEST] Step 2: Applying SMA Crossover Strategy...");
  const strategy = new SMACrossoverStrategy(short_window, long_window);
  const signals = strategy.generateSignals(historicalData);
  console.log("[BACKTEST] Generated", signals.length, "signals");

  // 3. Calculate Metrics
  console.log(
    "[BACKTEST] Step 3: Simulating trades and calculating metrics..."
  );
  const initialCapital = 100000.0;
  let cash = initialCapital;
  let holdings = 0;
  let totalTrades = 0;
  const trades: any[] = [];
  console.log("[BACKTEST] Initial Capital:", initialCapital);

  // Simple backtest loop
  console.log("[BACKTEST] Processing", signals.length, "signals...");
  for (let i = 0; i < signals.length; i++) {
    const point = signals[i];
    const price = point.close;

    // Buy signal
    if (point.position === 1.0) {
      // Buy 100 shares
      const quantity = 100;
      const cost = quantity * price;
      if (cash >= cost) {
        cash -= cost;
        holdings += quantity;
        totalTrades++;
        trades.push({
          date: point.date,
          action: "BUY",
          price: price,
          short_mavg: point.short_mavg,
          long_mavg: point.long_mavg,
        });
        console.log(
          "[BACKTEST] BUY Signal #" + totalTrades + " at",
          point.date,
          "- Price:",
          price,
          "Quantity:",
          quantity,
          "Cost:",
          cost,
          "Remaining Cash:",
          cash
        );
      } else {
        console.log(
          "[BACKTEST] BUY Signal at",
          point.date,
          "SKIPPED - Insufficient cash. Required:",
          cost,
          "Available:",
          cash
        );
      }
    }
    // Sell signal
    else if (point.position === -1.0) {
      if (holdings > 0) {
        const quantity = 100; // Sell 100 shares (simplified)
        if (holdings >= quantity) {
          const revenue = quantity * price;
          cash += revenue;
          holdings -= quantity;
          totalTrades++;
          trades.push({
            date: point.date,
            action: "SELL",
            price: price,
            short_mavg: point.short_mavg,
            long_mavg: point.long_mavg,
          });
          console.log(
            "[BACKTEST] SELL Signal #" + totalTrades + " at",
            point.date,
            "- Price:",
            price,
            "Quantity:",
            quantity,
            "Revenue:",
            revenue,
            "New Cash:",
            cash
          );
        } else {
          console.log(
            "[BACKTEST] SELL Signal at",
            point.date,
            "SKIPPED - Insufficient holdings. Required:",
            quantity,
            "Available:",
            holdings
          );
        }
      } else {
        console.log(
          "[BACKTEST] SELL Signal at",
          point.date,
          "SKIPPED - No holdings to sell"
        );
      }
    }
  }

  const finalPrice = signals[signals.length - 1].close;
  const holdingsValue = holdings * finalPrice;
  const finalValue = cash + holdingsValue;
  const totalReturn = finalValue - initialCapital;
  const returnPercentage = (totalReturn / initialCapital) * 100;

  console.log("[BACKTEST] ========== Backtest Complete ==========");
  console.log("[BACKTEST] Final Results:");
  console.log("[BACKTEST] - Initial Capital:", initialCapital);
  console.log("[BACKTEST] - Final Cash:", cash);
  console.log("[BACKTEST] - Holdings:", holdings, "shares");
  console.log(
    "[BACKTEST] - Holdings Value:",
    holdingsValue,
    "(at price",
    finalPrice + ")"
  );
  console.log("[BACKTEST] - Final Portfolio Value:", finalValue);
  console.log("[BACKTEST] - Total Return:", totalReturn);
  console.log(
    "[BACKTEST] - Return Percentage:",
    returnPercentage.toFixed(2) + "%"
  );
  console.log("[BACKTEST] - Total Trades:", totalTrades);
  console.log("[BACKTEST] ===========================================");

  return {
    initial_capital: initialCapital,
    final_value: finalValue,
    total_return: totalReturn,
    return_percentage: returnPercentage,
    total_trades: totalTrades,
    trades: trades,
  };
}
