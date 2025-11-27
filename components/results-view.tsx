"use client";

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

interface BacktestResult {
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

interface ResultsViewProps {
  results: BacktestResult | null;
}

export function ResultsView({ results }: ResultsViewProps) {
  if (!results) return null;

  const completedTrades = results.winning_trades + results.losing_trades;

  return (
    <div className="space-y-6 mt-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Return
          </h3>
          <p
            className={`text-2xl font-bold ${
              results.total_return >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            ₹{results.total_return.toLocaleString()}
          </p>
          <p
            className={`text-sm ${
              results.return_percentage >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {results.return_percentage.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Win Rate
          </h3>
          <p
            className={`text-2xl font-bold ${
              results.win_rate >= 50
                ? "text-green-600 dark:text-green-400"
                : "text-orange-600 dark:text-orange-400"
            }`}
          >
            {results.win_rate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {results.winning_trades}W / {results.losing_trades}L
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Max Drawdown
          </h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {results.max_drawdown_percentage.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ₹{results.max_drawdown.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Sharpe Ratio
          </h3>
          <p
            className={`text-2xl font-bold ${
              results.sharpe_ratio > 1
                ? "text-green-600 dark:text-green-400"
                : results.sharpe_ratio > 0
                ? "text-orange-600 dark:text-orange-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {results.sharpe_ratio.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Risk-adjusted return
          </p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Portfolio Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Initial Capital:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                ₹{results.initial_capital.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Final Value:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                ₹{results.final_value.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Total Fees Paid:
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                ₹{results.total_fees.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Total Trades:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {results.total_trades}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Trade Performance
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Completed Trades:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {completedTrades}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Avg Trade Return:
              </span>
              <span
                className={`font-medium ${
                  results.avg_trade_return >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                ₹{results.avg_trade_return.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Best Trade:
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                ₹{results.best_trade.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Worst Trade:
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                ₹{results.worst_trade.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Log */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Trade History ({results.trades.length} trades)
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Complete log of all executed trades during the backtest period
          </p>
        </div>
        {results.trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Portfolio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {results.trades.map((trade, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(trade.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          trade.action === "BUY"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {trade.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      ₹{trade.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      {trade.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      ₹{trade.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      ₹{trade.portfolio_value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No trades were executed during this backtest period.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Try adjusting your strategy parameters or increasing the initial
              capital.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
