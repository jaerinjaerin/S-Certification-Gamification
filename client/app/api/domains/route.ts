import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

import { withCors } from "@/lib/cors";
import * as Sentry from "@sentry/nextjs";

async function getHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domainCode = searchParams.get("domain_code");

  try {
    const domains = await prisma.domain.findMany({
      where: domainCode ? { code: domainCode } : undefined,
      include: {
        subsidiary: {
          include: {
            region: true,
          },
        },
      },
    });

    const response = NextResponse.json({ items: domains }, { status: 200 });
    response.headers.set("Cache-Control", "public, max-age=3600");
    return response;
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

export const GET = withCors(getHandler);
