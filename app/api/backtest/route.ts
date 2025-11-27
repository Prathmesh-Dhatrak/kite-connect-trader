import { NextResponse } from "next/server";
import { runBacktest } from "@/lib/backtest";

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[API/BACKTEST] [${requestId}] POST request received`);

  try {
    const body = await request.json();
    console.log(
      `[API/BACKTEST] [${requestId}] Request body:`,
      JSON.stringify(body, null, 2)
    );

    const {
      instrument_token,
      from_date,
      to_date,
      interval,
      short_window,
      long_window,
    } = body;

    // Validate required parameters
    if (!instrument_token) {
      console.error(
        `[API/BACKTEST] [${requestId}] ERROR: Missing instrument_token`
      );
      return NextResponse.json(
        { error: "instrument_token is required" },
        { status: 400 }
      );
    }
    if (!from_date || !to_date) {
      console.error(
        `[API/BACKTEST] [${requestId}] ERROR: Missing date parameters`
      );
      return NextResponse.json(
        { error: "from_date and to_date are required" },
        { status: 400 }
      );
    }
    if (!short_window || !long_window) {
      console.error(
        `[API/BACKTEST] [${requestId}] ERROR: Missing window parameters`
      );
      return NextResponse.json(
        { error: "short_window and long_window are required" },
        { status: 400 }
      );
    }

    console.log(`[API/BACKTEST] [${requestId}] Starting backtest...`);
    const startTime = Date.now();

    const result = await runBacktest(
      instrument_token,
      from_date,
      to_date,
      interval,
      short_window,
      long_window
    );

    const duration = Date.now() - startTime;
    console.log(
      `[API/BACKTEST] [${requestId}] Backtest completed successfully in ${duration}ms`
    );
    console.log(
      `[API/BACKTEST] [${requestId}] Result summary: Return=${result.return_percentage.toFixed(
        2
      )}%, Trades=${result.total_trades}`
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`[API/BACKTEST] [${requestId}] ERROR:`, error.message);
    console.error(`[API/BACKTEST] [${requestId}] Stack trace:`, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
