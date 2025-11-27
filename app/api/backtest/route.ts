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
      initial_capital,
      strategy_id,
      strategy_params,
      custom_strategy, // For custom strategies, pass the full definition
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
    if (!strategy_id) {
      console.error(`[API/BACKTEST] [${requestId}] ERROR: Missing strategy_id`);
      return NextResponse.json(
        { error: "strategy_id is required" },
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
      strategy_id,
      strategy_params || {},
      initial_capital,
      custom_strategy // Pass custom strategy definition if provided
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[API/BACKTEST] [${requestId}] ERROR:`, err.message);
    console.error(`[API/BACKTEST] [${requestId}] Stack trace:`, err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
