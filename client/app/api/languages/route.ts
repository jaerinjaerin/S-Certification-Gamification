import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

import * as Sentry from "@sentry/nextjs";

export async function GET() {
  // console.warn("GET /api/languages");
  try {
    const languages = await prisma.language.findMany();
    // console.log("languages");

    return NextResponse.json({ items: languages }, { status: 200 });
    // const response = NextResponse.json({ items: languages }, { status: 200 });
    // response.headers.set("Cache-Control", "public, max-age=3600");
    // return response;
  } catch (error) {
    console.error("Error Domain Data:", error);
    Sentry.captureException(error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        error: {
          code: "INTERNAL_SERVER_ERROR",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
