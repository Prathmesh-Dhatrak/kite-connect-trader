import { KiteConnect } from "kiteconnect";

const apiKey = process.env.KITE_API_KEY;
const accessToken = process.env.KITE_ACCESS_TOKEN;

console.log("[KITE] Initializing Kite Connect client...");
console.log("[KITE] API Key present:", !!apiKey);
console.log("[KITE] Access Token present:", !!accessToken);

if (!apiKey) {
  console.error(
    "[KITE] ERROR: KITE_API_KEY is missing in environment variables"
  );
}

export const kite = new KiteConnect({
  api_key: apiKey || "missing_key",
});

if (accessToken) {
  kite.setAccessToken(accessToken);
  console.log("[KITE] Access token set successfully");
} else {
  console.error(
    "[KITE] ERROR: KITE_ACCESS_TOKEN is missing in environment variables"
  );
}

console.log("[KITE] Kite Connect client initialized");

export async function getQuote(instruments: string[]) {
  console.log("[KITE] getQuote called with instruments:", instruments);
  try {
    const startTime = Date.now();
    const result = await kite.getQuote(instruments);
    const duration = Date.now() - startTime;
    console.log(
      "[KITE] getQuote successful. Duration:",
      duration + "ms",
      "Instruments count:",
      instruments.length
    );
    return result;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[KITE] getQuote ERROR:", err.message);
    console.error("[KITE] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function getHistoricalData(
  instrument_token: string,
  from_date: string,
  to_date: string,
  interval: string
) {
  console.log("[KITE] getHistoricalData called");
  console.log("[KITE] - Instrument Token:", instrument_token);
  console.log("[KITE] - From Date:", from_date);
  console.log("[KITE] - To Date:", to_date);
  console.log("[KITE] - Interval:", interval);

  try {
    const startTime = Date.now();
    // @ts-expect-error - KiteConnect types are incomplete
    const result = await kite.getHistoricalData(
      instrument_token,
      interval,
      from_date,
      to_date
    );
    const duration = Date.now() - startTime;
    console.log(
      "[KITE] getHistoricalData successful. Duration:",
      duration + "ms",
      "Data points:",
      result?.length || 0
    );
    return result;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[KITE] getHistoricalData ERROR:", err.message);
    console.error("[KITE] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function getUserProfile() {
  console.log("[KITE] getUserProfile called");
  try {
    const startTime = Date.now();
    const result = await kite.getProfile();
    const duration = Date.now() - startTime;
    console.log("[KITE] getUserProfile successful. Duration:", duration + "ms");
    console.log("[KITE] User:", result.user_name, "ID:", result.user_id);
    return result;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[KITE] getUserProfile ERROR:", err.message);
    console.error("[KITE] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function placeOrder(params: Record<string, unknown>) {
  console.log("[KITE] placeOrder called");
  console.log("[KITE] Order params:", JSON.stringify(params, null, 2));
  try {
    const startTime = Date.now();
    const result = await kite.placeOrder(params.variety as string, params);
    const duration = Date.now() - startTime;
    console.log(
      "[KITE] placeOrder successful. Duration:",
      duration + "ms",
      "Order ID:",
      result
    );
    return result;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[KITE] placeOrder ERROR:", err.message);
    console.error("[KITE] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}
