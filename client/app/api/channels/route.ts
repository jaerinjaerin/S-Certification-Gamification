export const dynamic = "force-dynamic";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("GET handler called");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/jsons/channels.json`
    );
    console.log("response", response);
    const data = await response.json();
    console.log("channels.json", data);

    // request.setHeader("Access-Control-Allow-Origin", "*");
    // request.status(200).json(data);

    return NextResponse.json({ items: data }, { status: 201 });
  } catch (error) {
    console.error("Error in GET handler:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
