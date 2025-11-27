"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getAllStrategies } from "@/lib/strategy/get-all-strategies";
import { CustomStrategyStorage } from "@/lib/custom-strategy-storage";

interface StrategyParameter {
  name: string;
  label: string;
  type: "number" | "select";
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string | number; label: string }>;
  description?: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: StrategyParameter[];
  isCustom?: boolean;
}

interface BacktestFormProps {
  onRunBacktest: (data: unknown) => void;
  isLoading: boolean;
}

export function BacktestForm({ onRunBacktest, isLoading }: BacktestFormProps) {
  console.log("[BACKTEST_FORM] Component rendered, isLoading:", isLoading);

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [formData, setFormData] = useState({
    instrument_token: "408065",
    from_date: "2023-01-01",
    to_date: "2023-12-31",
    interval: "day",
    initial_capital: 500000,
    strategy_id: "sma_crossover",
    strategy_params: {} as Record<string, number>,
  });

  // Fetch available strategies (built-in + custom)
  useEffect(() => {
    async function fetchStrategies() {
      try {
        const allStrategies = await getAllStrategies();
        setStrategies(allStrategies as Strategy[]);

        // Set default strategy
        const defaultStrategy = allStrategies.find(
          (s) => s.id === "sma_crossover"
        );
        if (defaultStrategy) {
          setSelectedStrategy(defaultStrategy as Strategy);
          // Initialize strategy params with defaults
          const params: Record<string, number> = {};
          const parameters = (defaultStrategy.parameters || {}) as Record<
            string,
            { default: number | string }
          >;
          Object.entries(parameters).forEach(([name, param]) => {
            params[name] = param.default as number;
          });
          setFormData((prev) => ({
            ...prev,
            strategy_params: params,
          }));
        }
      } catch (error) {
        console.error("[BACKTEST_FORM] Error fetching strategies:", error);
      }
    }
    fetchStrategies();
  }, []);

  console.log("[BACKTEST_FORM] Current form data:", formData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("[BACKTEST_FORM] Form field changed:", name, "=", value);

    // Handle strategy change
    if (name === "strategy_id") {
      const strategy = strategies.find((s) => s.id === value);
      if (strategy) {
        setSelectedStrategy(strategy);
        // Reset strategy params with new defaults
        const params: Record<string, number> = {};
        strategy.parameters.forEach((p) => {
          params[p.name] = p.default as number;
        });
        setFormData((prev) => ({
          ...prev,
          strategy_id: value,
          strategy_params: params,
        }));
      }
    }
    // Handle strategy parameter change
    else if (name.startsWith("param_")) {
      const paramName = name.replace("param_", "");
      setFormData((prev) => ({
        ...prev,
        strategy_params: {
          ...prev.strategy_params,
          [paramName]: parseFloat(value),
        },
      }));
    }
    // Handle other fields
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[BACKTEST_FORM] Form submitted");

    interface BacktestData {
      instrument_token: string;
      from_date: string;
      to_date: string;
      interval: string;
      initial_capital: number;
      strategy_id: string;
      strategy_params: Record<string, number>;
      custom_strategy?: unknown;
    }

    const backtestData: BacktestData = {
      instrument_token: formData.instrument_token,
      from_date: formData.from_date,
      to_date: formData.to_date,
      interval: formData.interval,
      initial_capital: Number(formData.initial_capital),
      strategy_id: formData.strategy_id,
      strategy_params: formData.strategy_params,
    };

    // If it's a custom strategy, fetch and include the custom strategy definition
    if (formData.strategy_id.startsWith("custom_")) {
      const customId = formData.strategy_id.replace("custom_", "");
      const customStrategies = CustomStrategyStorage.getAll();
      const customStrategy = customStrategies.find((s) => s.id === customId);

      if (customStrategy) {
        backtestData.custom_strategy = customStrategy;
        console.log(
          "[BACKTEST_FORM] Including custom strategy:",
          customStrategy.name
        );
      }
    }

    console.log("[BACKTEST_FORM] Parsed backtest data:", backtestData);
    onRunBacktest(backtestData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Strategy Backtest
      </h2>

      {/* Strategy Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Trading Strategy
        </label>
        <select
          name="strategy_id"
          value={formData.strategy_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {strategies.map((strategy) => (
            <option key={strategy.id} value={strategy.id}>
              {strategy.name}
            </option>
          ))}
        </select>
        {selectedStrategy && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {selectedStrategy.description}
          </p>
        )}
      </div>

      {/* Strategy Parameters */}
      {selectedStrategy && selectedStrategy.parameters.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Strategy Parameters
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {selectedStrategy.parameters.map((param) => (
              <div key={param.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {param.label}
                </label>
                {param.type === "number" && (
                  <>
                    <input
                      type="number"
                      name={`param_${param.name}`}
                      value={
                        formData.strategy_params[param.name] || param.default
                      }
                      onChange={handleChange}
                      min={param.min}
                      max={param.max}
                      step={param.step || 1}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    {param.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {param.description}
                      </p>
                    )}
                  </>
                )}
                {param.type === "select" && param.options && (
                  <select
                    name={`param_${param.name}`}
                    value={
                      formData.strategy_params[param.name] || param.default
                    }
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {param.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Instrument Token
        </label>
        <input
          type="text"
          name="instrument_token"
          value={formData.instrument_token}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            From Date
          </label>
          <input
            type="date"
            name="from_date"
            value={formData.from_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            To Date
          </label>
          <input
            type="date"
            name="to_date"
            value={formData.to_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Interval
        </label>
        <select
          name="interval"
          value={formData.interval}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="day">Day</option>
          <option value="60minute">60 Minute</option>
          <option value="30minute">30 Minute</option>
          <option value="15minute">15 Minute</option>
          <option value="5minute">5 Minute</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Initial Capital (₹)
        </label>
        <input
          type="number"
          name="initial_capital"
          value={formData.initial_capital}
          onChange={handleChange}
          min="10000"
          step="10000"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Recommended: ₹500,000 or more for diverse strategies
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {isLoading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          "Run Backtest"
        )}
      </button>
    </form>
  );
}
