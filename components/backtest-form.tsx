"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface BacktestFormProps {
  onRunBacktest: (data: any) => void;
  isLoading: boolean;
}

export function BacktestForm({ onRunBacktest, isLoading }: BacktestFormProps) {
  console.log("[BACKTEST_FORM] Component rendered, isLoading:", isLoading);

  const [formData, setFormData] = useState({
    instrument_token: "408065",
    from_date: "2023-01-01",
    to_date: "2023-12-31",
    interval: "day",
    initial_capital: 500000,
    short_window: 20,
    long_window: 50,
  });

  console.log("[BACKTEST_FORM] Current form data:", formData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("[BACKTEST_FORM] Form field changed:", name, "=", value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[BACKTEST_FORM] Form submitted");

    const backtestData = {
      ...formData,
      initial_capital: Number(formData.initial_capital),
      short_window: Number(formData.short_window),
      long_window: Number(formData.long_window),
    };

    console.log("[BACKTEST_FORM] Parsed backtest data:", backtestData);
    onRunBacktest(backtestData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        SMA Crossover Backtest
      </h2>

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Short Window
          </label>
          <input
            type="number"
            name="short_window"
            value={formData.short_window}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Long Window
          </label>
          <input
            type="number"
            name="long_window"
            value={formData.long_window}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
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
