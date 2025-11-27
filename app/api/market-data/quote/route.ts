import { NextResponse } from "next/server";
import { getQuote } from "@/lib/kite";

export async function GET(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[API/QUOTE] [${requestId}] GET request received`);

  const { searchParams } = new URL(request.url);
  const instruments = searchParams.get("instruments");
  console.log(`[API/QUOTE] [${requestId}] Instruments parameter:`, instruments);

  if (!instruments) {
    console.error(
      `[API/QUOTE] [${requestId}] ERROR: Missing instruments parameter`
    );
    return NextResponse.json(
      { error: "Missing instruments parameter" },
      { status: 400 }
    );
  }

  try {
    const instrumentList = instruments.split(",");
    console.log(
      `[API/QUOTE] [${requestId}] Parsed instruments:`,
      instrumentList
    );
    console.log(
      `[API/QUOTE] [${requestId}] Fetching quotes for ${instrumentList.length} instrument(s)...`
    );

    const startTime = Date.now();
    const data = await getQuote(instrumentList);
    const duration = Date.now() - startTime;

    console.log(
      `[API/QUOTE] [${requestId}] Quotes fetched successfully in ${duration}ms`
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[API/QUOTE] [${requestId}] ERROR:`, err.message);
    console.error(`[API/QUOTE] [${requestId}] Stack trace:`, err.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
