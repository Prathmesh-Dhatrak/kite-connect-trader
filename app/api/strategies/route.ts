import { NextResponse } from "next/server";
import { strategyRegistry } from "@/lib/strategy/registry";

export async function GET() {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[API/STRATEGIES] [${requestId}] GET request received`);

  try {
    const strategies = strategyRegistry.getAll();

    const result = strategies.map(({ id, strategy }) => {
      const config = strategy.getConfig();
      return {
        id,
        name: config.name,
        description: config.description,
        parameters: config.parameters,
      };
    });

    console.log(
      `[API/STRATEGIES] [${requestId}] Returning ${result.length} strategies`
    );

    return NextResponse.json({ strategies: result });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[API/STRATEGIES] [${requestId}] ERROR:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
