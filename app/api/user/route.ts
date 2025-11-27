import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/kite";

export async function GET() {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[API/USER] [${requestId}] GET request received`);

  try {
    console.log(`[API/USER] [${requestId}] Fetching user profile...`);
    const startTime = Date.now();

    const profile = await getUserProfile();

    const duration = Date.now() - startTime;
    console.log(
      `[API/USER] [${requestId}] Profile fetched successfully in ${duration}ms`
    );
    console.log(
      `[API/USER] [${requestId}] User: ${profile.user_name} (${profile.user_id})`
    );

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error(`[API/USER] [${requestId}] ERROR:`, error.message);
    console.error(`[API/USER] [${requestId}] Stack trace:`, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
