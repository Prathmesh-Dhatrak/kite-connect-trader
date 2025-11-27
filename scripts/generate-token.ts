/**
 * Kite Connect Token Generation Helper
 *
 * This script helps you generate a valid access token for Kite Connect API.
 *
 * Usage:
 *   tsx scripts/generate-token.ts                    - Show login URL
 *   tsx scripts/generate-token.ts <request_token>    - Generate access token
 */

import crypto from "crypto";
import https from "https";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const API_KEY = process.env.KITE_API_KEY;
const API_SECRET = process.env.KITE_API_SECRET;
const REDIRECT_URL = process.env.KITE_REDIRECT_URL || "http://localhost:3000";
const request_token = process.argv[2];

console.log("=".repeat(60));
console.log("Kite Connect Token Generation Helper");
console.log("=".repeat(60));
console.log("");

if (!API_KEY || !API_SECRET) {
  console.error(
    "❌ ERROR: KITE_API_KEY and KITE_API_SECRET must be set in .env.local"
  );
  process.exit(1);
}

// If no request token provided, show instructions
if (!request_token) {
  console.log("Current Configuration:");
  console.log("- API Key:", API_KEY);
  console.log("- API Secret:", API_SECRET.substring(0, 4) + "***");
  console.log("- Redirect URL:", REDIRECT_URL);
  console.log("");

  const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${API_KEY}&v=3`;

  console.log("STEP 1: Login to Kite Connect");
  console.log("=".repeat(60));
  console.log("Visit this URL in your browser:");
  console.log("");
  console.log(loginUrl);
  console.log("");

  console.log("STEP 2: Get Request Token");
  console.log("=".repeat(60));
  console.log("After login, you will be redirected to:");
  console.log(
    `${REDIRECT_URL}?request_token=XXXXXX&action=login&status=success`
  );
  console.log("");
  console.log("Copy the request_token value from the URL");
  console.log("");

  console.log("STEP 3: Generate Access Token");
  console.log("=".repeat(60));
  console.log("Run this command with your request_token:");
  console.log("");
  console.log(`tsx scripts/generate-token.ts YOUR_REQUEST_TOKEN`);
  console.log("");

  console.log("NOTE: Access tokens expire daily. You need to regenerate them.");
  console.log("");
  process.exit(0);
}

// Generate access token
const checksum = crypto
  .createHash("sha256")
  .update(API_KEY + request_token + API_SECRET)
  .digest("hex");

console.log("[TOKEN_GEN] Generating access token...");
console.log("[TOKEN_GEN] API Key:", API_KEY);
console.log("[TOKEN_GEN] Request Token:", request_token);
console.log("[TOKEN_GEN] Checksum:", checksum);
console.log("");

const postData = new URLSearchParams({
  api_key: API_KEY,
  request_token: request_token,
  checksum: checksum,
}).toString();

const options = {
  hostname: "api.kite.trade",
  port: 443,
  path: "/session/token",
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": postData.length,
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    try {
      const response = JSON.parse(data);
      console.log("[TOKEN_GEN] Response:", JSON.stringify(response, null, 2));
      console.log("");

      if (response.status === "success") {
        console.log("✅ SUCCESS! Access token generated:");
        console.log("");
        console.log("=".repeat(60));
        console.log("KITE_ACCESS_TOKEN=" + response.data.access_token);
        console.log("=".repeat(60));
        console.log("");
        console.log("User Details:");
        console.log("- Name:", response.data.user_name);
        console.log("- User ID:", response.data.user_id);
        console.log("- Email:", response.data.email);
        console.log("- Broker:", response.data.broker);
        console.log("");
        console.log("📝 Update your .env.local file with the new token above!");
      } else {
        console.error("❌ ERROR:", response.message || "Unknown error");
        console.error("Full response:", response);
      }
    } catch (e) {
      const error = e as Error;
      console.error("❌ Failed to parse response:", error.message);
      console.error("Raw response:", data);
    }
  });
});

req.on("error", (e) => {
  console.error("❌ Request failed:", e.message);
});

req.write(postData);
req.end();
