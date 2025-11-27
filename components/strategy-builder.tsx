"use client";

import { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import {
  CustomStrategyStorage,
  CustomStrategyCondition,
  CustomStrategyRule,
} from "@/lib/custom-strategy-storage";

export function StrategyBuilder() {
  const [strategyName, setStrategyName] = useState("");
  const [strategyDescription, setStrategyDescription] = useState("");
  const [buyConditions, setBuyConditions] = useState<CustomStrategyCondition[]>(
    []
  );
  const [sellConditions, setSellConditions] = useState<
    CustomStrategyCondition[]
  >([]);
  const [showBuilder, setShowBuilder] = useState(false);

  const addCondition = (type: "buy" | "sell") => {
    const newCondition: CustomStrategyCondition = {
      id: `cond_${Date.now()}`,
      indicator1: { type: "sma", period: 20 },
      operator: ">",
      indicator2: { type: "sma", period: 50 },
    };

    if (type === "buy") {
      setBuyConditions([...buyConditions, newCondition]);
    } else {
      setSellConditions([...sellConditions, newCondition]);
    }
  };

  const removeCondition = (type: "buy" | "sell", id: string) => {
    if (type === "buy") {
      setBuyConditions(buyConditions.filter((c) => c.id !== id));
    } else {
      setSellConditions(sellConditions.filter((c) => c.id !== id));
    }
  };

  const updateCondition = (
    type: "buy" | "sell",
    id: string,
    field: string,
    value: unknown
  ) => {
    const updateFn = (conditions: CustomStrategyCondition[]) =>
      conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c));

    if (type === "buy") {
      setBuyConditions(updateFn(buyConditions));
    } else {
      setSellConditions(updateFn(sellConditions));
    }
  };

  const saveStrategy = () => {
    if (!strategyName.trim()) {
      alert("Please enter a strategy name");
      return;
    }

    if (buyConditions.length === 0 || sellConditions.length === 0) {
      alert("Please add at least one buy and one sell condition");
      return;
    }

    const buyRules: CustomStrategyRule[] = [
      {
        type: "buy",
        conditions: buyConditions,
        logic: "and",
      },
    ];

    const sellRules: CustomStrategyRule[] = [
      {
        type: "sell",
        conditions: sellConditions,
        logic: "and",
      },
    ];

    CustomStrategyStorage.save({
      name: strategyName,
      description: strategyDescription,
      buyRules,
      sellRules,
      parameters: [],
    });

    alert("Strategy saved successfully!");
    resetForm();
  };

  const resetForm = () => {
    setStrategyName("");
    setStrategyDescription("");
    setBuyConditions([]);
    setSellConditions([]);
    setShowBuilder(false);
  };

  if (!showBuilder) {
    return (
      <button
        onClick={() => setShowBuilder(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        <Plus className="h-5 w-5" />
        Create Custom Strategy
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Strategy Builder
        </h2>
        <button
          onClick={resetForm}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Strategy Info */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Strategy Name *
          </label>
          <input
            type="text"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            placeholder="e.g., My Golden Cross Strategy"
            className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={strategyDescription}
            onChange={(e) => setStrategyDescription(e.target.value)}
            placeholder="Describe your strategy..."
            rows={2}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Buy Conditions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Buy Conditions
          </h3>
          <button
            onClick={() => addCondition("buy")}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Add Condition
          </button>
        </div>
        {buyConditions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No buy conditions yet. Click &quot;Add Condition&quot; to start.
          </p>
        ) : (
          <div className="space-y-3">
            {buyConditions.map((condition, index) => (
              <ConditionRow
                key={condition.id}
                condition={condition}
                index={index}
                onUpdate={(field, value) =>
                  updateCondition("buy", condition.id, field, value)
                }
                onRemove={() => removeCondition("buy", condition.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sell Conditions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Sell Conditions
          </h3>
          <button
            onClick={() => addCondition("sell")}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Add Condition
          </button>
        </div>
        {sellConditions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No sell conditions yet. Click &quot;Add Condition&quot; to start.
          </p>
        ) : (
          <div className="space-y-3">
            {sellConditions.map((condition, index) => (
              <ConditionRow
                key={condition.id}
                condition={condition}
                index={index}
                onUpdate={(field, value) =>
                  updateCondition("sell", condition.id, field, value)
                }
                onRemove={() => removeCondition("sell", condition.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={saveStrategy}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Save className="h-4 w-4" />
          Save Strategy
        </button>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface ConditionRowProps {
  condition: CustomStrategyCondition;
  index: number;
  onUpdate: (field: string, value: unknown) => void;
  onRemove: () => void;
}

function ConditionRow({
  condition,
  index,
  onUpdate,
  onRemove,
}: ConditionRowProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
        {index + 1}.
      </span>

      {/* Indicator 1 */}
      <select
        value={condition.indicator1.type}
        onChange={(e) =>
          onUpdate("indicator1", {
            ...condition.indicator1,
            type: e.target.value,
          })
        }
        className="text-sm rounded border-gray-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="sma">SMA</option>
        <option value="ema">EMA</option>
        <option value="rsi">RSI</option>
        <option value="price">Price</option>
      </select>

      {condition.indicator1.type !== "price" && (
        <input
          type="number"
          value={condition.indicator1.period || 20}
          onChange={(e) =>
            onUpdate("indicator1", {
              ...condition.indicator1,
              period: parseInt(e.target.value),
            })
          }
          className="w-16 text-sm rounded border-gray-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          min="1"
        />
      )}

      {/* Operator */}
      <select
        value={condition.operator}
        onChange={(e) => onUpdate("operator", e.target.value)}
        className="text-sm rounded border-gray-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value=">">{">"}</option>
        <option value="<">{"<"}</option>
        <option value=">=">{">="}</option>
        <option value="<=">{"<="}</option>
        <option value="crosses_above">Crosses Above</option>
        <option value="crosses_below">Crosses Below</option>
      </select>

      {/* Indicator 2 */}
      <select
        value={condition.indicator2.type}
        onChange={(e) =>
          onUpdate("indicator2", {
            ...condition.indicator2,
            type: e.target.value,
          })
        }
        className="text-sm rounded border-gray-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="sma">SMA</option>
        <option value="ema">EMA</option>
        <option value="rsi">RSI</option>
        <option value="price">Price</option>
      </select>

      {condition.indicator2.type !== "price" && (
        <input
          type="number"
          value={condition.indicator2.period || 50}
          onChange={(e) =>
            onUpdate("indicator2", {
              ...condition.indicator2,
              period: parseInt(e.target.value),
            })
          }
          className="w-16 text-sm rounded border-gray-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          min="1"
        />
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
