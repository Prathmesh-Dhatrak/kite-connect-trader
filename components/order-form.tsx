"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function OrderForm() {
  console.log("[ORDER_FORM] Component rendered");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    tradingsymbol: "INFY",
    exchange: "NSE",
    transaction_type: "BUY",
    quantity: 1,
    product: "CNC",
    order_type: "MARKET",
    price: "",
  });

  console.log("[ORDER_FORM] Current form data:", formData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("[ORDER_FORM] Form field changed:", name, "=", value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ORDER_FORM] Form submitted");
    setIsLoading(true);
    setMessage("");

    try {
      const orderData = {
        ...formData,
        quantity: Number(formData.quantity),
        price: formData.price ? Number(formData.price) : undefined,
      };

      console.log("[ORDER_FORM] Sending order request:", orderData);

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      console.log("[ORDER_FORM] Response status:", res.status);

      const data = await res.json();
      console.log("[ORDER_FORM] Response data:", data);

      if (res.ok) {
        const successMsg = `Order placed successfully! ID: ${data.order_id}`;
        console.log("[ORDER_FORM] SUCCESS:", successMsg);
        setMessage(successMsg);
      } else {
        const errorMsg = `Error: ${data.error}`;
        console.error("[ORDER_FORM] ERROR:", errorMsg);
        setMessage(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = `Failed to place order: ${error.message}`;
      console.error("[ORDER_FORM] EXCEPTION:", errorMsg);
      console.error("[ORDER_FORM] Error details:", error);
      setMessage(errorMsg);
    } finally {
      setIsLoading(false);
      console.log("[ORDER_FORM] Request completed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Place Order
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Symbol
          </label>
          <input
            type="text"
            name="tradingsymbol"
            value={formData.tradingsymbol}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Exchange
          </label>
          <select
            name="exchange"
            value={formData.exchange}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Transaction Type
          </label>
          <select
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Product
          </label>
          <select
            name="product"
            value={formData.product}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="CNC">CNC</option>
            <option value="MIS">MIS</option>
            <option value="NRML">NRML</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Order Type
          </label>
          <select
            name="order_type"
            value={formData.order_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="MARKET">MARKET</option>
            <option value="LIMIT">LIMIT</option>
          </select>
        </div>
      </div>

      {formData.order_type === "LIMIT" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
      >
        {isLoading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          "Place Order"
        )}
      </button>

      {message && (
        <div
          className={`mt-2 text-sm ${
            message.startsWith("Error")
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
