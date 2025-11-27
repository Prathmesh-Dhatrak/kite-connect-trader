"use client";

import { useState } from "react";
import { BacktestForm } from "@/components/backtest-form";
import { ResultsView } from "@/components/results-view";
import { OrderForm } from "@/components/order-form";
import { UserProfile } from "@/components/user-profile";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  console.log("[HOME] Component rendered");

  const [activeTab, setActiveTab] = useState<"backtest" | "trade" | "profile">(
    "backtest"
  );
  const [backtestResults, setBacktestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log("[HOME] Active tab:", activeTab, "isLoading:", isLoading);

  const handleRunBacktest = async (data: any) => {
    console.log("[HOME] handleRunBacktest called with data:", data);
    setIsLoading(true);
    setBacktestResults(null);

    try {
      console.log("[HOME] Sending backtest request to API...");
      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log("[HOME] Backtest API response status:", res.status);

      const result = await res.json();
      console.log("[HOME] Backtest API response data:", result);

      if (res.ok) {
        console.log("[HOME] Backtest successful, setting results");
        setBacktestResults(result);
      } else {
        const errorMsg = "Error: " + (result.error || "Unknown error");
        console.error("[HOME] Backtest failed:", errorMsg);
        alert(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = "Failed to run backtest: " + error.message;
      console.error("[HOME] Backtest exception:", errorMsg);
      console.error("[HOME] Error details:", error);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
      console.log("[HOME] Backtest request completed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Kite Connect Trader
          </h1>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow p-1 inline-flex">
            <button
              onClick={() => {
                console.log("[HOME] Tab changed to: backtest");
                setActiveTab("backtest");
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === "backtest"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Backtest
            </button>
            <button
              onClick={() => {
                console.log("[HOME] Tab changed to: trade");
                setActiveTab("trade");
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === "trade"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Trade
            </button>
            <button
              onClick={() => {
                console.log("[HOME] Tab changed to: profile");
                setActiveTab("profile");
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === "profile"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {activeTab === "backtest" && (
            <>
              <BacktestForm
                onRunBacktest={handleRunBacktest}
                isLoading={isLoading}
              />
              <ResultsView results={backtestResults} />
            </>
          )}

          {activeTab === "trade" && <OrderForm />}

          {activeTab === "profile" && <UserProfile />}
        </div>
      </div>
    </div>
  );
}

