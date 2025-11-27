"use client";

import { useState } from "react";
import { Trash2, Download, Upload } from "lucide-react";
import {
  CustomStrategyStorage,
  CustomStrategy,
} from "@/lib/custom-strategy-storage";

export function StrategyList() {
  const [strategies, setStrategies] = useState<CustomStrategy[]>(() => {
    return CustomStrategyStorage.getAll();
  });

  const loadStrategies = () => {
    const loaded = CustomStrategyStorage.getAll();
    setStrategies(loaded);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete strategy "${name}"?`)) {
      CustomStrategyStorage.delete(id);
      loadStrategies();
    }
  };

  const handleExport = () => {
    const json = CustomStrategyStorage.export();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strategies_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (CustomStrategyStorage.import(json)) {
        alert("Strategies imported successfully!");
        loadStrategies();
      } else {
        alert("Failed to import strategies. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  if (strategies.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No custom strategies yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export/Import Controls */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Download className="h-4 w-4" />
          Export All
        </button>
        <label className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer">
          <Upload className="h-4 w-4" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* Strategy List */}
      <div className="grid gap-4">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {strategy.name}
                </h3>
                {strategy.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {strategy.description}
                  </p>
                )}
                <div className="flex gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Buy Rules: {strategy.buyRules[0]?.conditions.length || 0}
                  </span>
                  <span>
                    Sell Rules: {strategy.sellRules[0]?.conditions.length || 0}
                  </span>
                  <span>
                    Created: {new Date(strategy.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(strategy.id, strategy.name)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete strategy"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Strategy Details */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buy Conditions
                </h4>
                <div className="space-y-1">
                  {strategy.buyRules[0]?.conditions.map((cond, idx) => (
                    <div
                      key={cond.id}
                      className="text-xs bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded"
                    >
                      {idx + 1}. {cond.indicator1.type}
                      {cond.indicator1.period
                        ? `(${cond.indicator1.period})`
                        : ""}{" "}
                      {cond.operator} {cond.indicator2.type}
                      {cond.indicator2.period
                        ? `(${cond.indicator2.period})`
                        : ""}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sell Conditions
                </h4>
                <div className="space-y-1">
                  {strategy.sellRules[0]?.conditions.map((cond, idx) => (
                    <div
                      key={cond.id}
                      className="text-xs bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-1 rounded"
                    >
                      {idx + 1}. {cond.indicator1.type}
                      {cond.indicator1.period
                        ? `(${cond.indicator1.period})`
                        : ""}{" "}
                      {cond.operator} {cond.indicator2.type}
                      {cond.indicator2.period
                        ? `(${cond.indicator2.period})`
                        : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
