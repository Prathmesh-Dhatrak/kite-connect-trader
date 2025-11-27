import { NextResponse } from "next/server";
import { placeOrder } from "@/lib/kite";

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[API/ORDER] [${requestId}] POST request received`);

  try {
    const body = await request.json();
    console.log(
      `[API/ORDER] [${requestId}] Request body:`,
      JSON.stringify(body, null, 2)
    );

    // Validate required parameters
    if (!body.tradingsymbol) {
      console.error(`[API/ORDER] [${requestId}] ERROR: Missing tradingsymbol`);
      return NextResponse.json(
        { error: "tradingsymbol is required" },
        { status: 400 }
      );
    }
    if (!body.exchange) {
      console.error(`[API/ORDER] [${requestId}] ERROR: Missing exchange`);
      return NextResponse.json(
        { error: "exchange is required" },
        { status: 400 }
      );
    }
    if (!body.transaction_type) {
      console.error(
        `[API/ORDER] [${requestId}] ERROR: Missing transaction_type`
      );
      return NextResponse.json(
        { error: "transaction_type is required" },
        { status: 400 }
      );
    }
    if (!body.quantity) {
      console.error(`[API/ORDER] [${requestId}] ERROR: Missing quantity`);
      return NextResponse.json(
        { error: "quantity is required" },
        { status: 400 }
      );
    }

    // Ensure variety is present
    if (!body.variety) {
      console.log(
        `[API/ORDER] [${requestId}] Variety not provided, defaulting to 'regular'`
      );
      body.variety = "regular";
    }

    console.log(`[API/ORDER] [${requestId}] Placing order...`);
    const startTime = Date.now();

    const orderId = await placeOrder(body);

    const duration = Date.now() - startTime;
    console.log(
      `[API/ORDER] [${requestId}] Order placed successfully in ${duration}ms`
    );
    console.log(`[API/ORDER] [${requestId}] Order ID:`, orderId);

    return NextResponse.json({ status: "success", order_id: orderId });
  } catch (error: any) {
    console.error(`[API/ORDER] [${requestId}] ERROR:`, error.message);
    console.error(`[API/ORDER] [${requestId}] Stack trace:`, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
