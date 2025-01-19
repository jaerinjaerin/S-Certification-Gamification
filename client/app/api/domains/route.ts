import { prisma } from "@/prisma-client";
import { Domain } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import * as Sentry from "@sentry/nextjs";

// Config CORS
// ========================================================
/**
 *
 * @param origin
 * @returns
 */
const getCorsHeaders = (origin: string) => {
  // Default options
  const headers = {
    "Access-Control-Allow-Methods": `${process.env.ALLOWED_METHODS}`,
    "Access-Control-Allow-Headers": `${process.env.ALLOWED_HEADERS}`,
    "Access-Control-Allow-Origin": `${process.env.NEXT_PUBLIC_API_URL}`,
  };

  console.log("getCorsHeaders: origin:", origin);

  // If no allowed origin is set to default server origin
  if (!process.env.ALLOWED_ORIGIN || !origin) return headers;

  // If allowed origin is set, check if origin is in allowed origins
  const allowedOrigins = process.env.ALLOWED_ORIGIN.split(",");

  // Validate server origin
  if (allowedOrigins.includes("*")) {
    headers["Access-Control-Allow-Origin"] = "*";
  } else if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  // Return result
  return headers;
};

// Endpoints
// ========================================================
/**
 * Basic OPTIONS Request to simuluate OPTIONS preflight request for mutative requests
 */
export const OPTIONS = async (request: NextRequest) => {
  console.log("OPTIONS: request:", request);
  // Return Response
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: getCorsHeaders(request.headers.get("origin") || ""),
    }
  );
};

export async function GET() {
  try {
    const domains = await prisma.domain.findMany();

    // console.log("domains:", domains);

    // Map over domains to include parsed channelSegmentIds
    const enrichedDomains = await Promise.all(
      domains.map(async (domain: Domain) => {
        // Parse channelSegmentIds (assuming it's stored as a JSON string)
        // const channelSegmentIds = domain.channelSegmentIds
        //   ? domain.channelSegmentIds.split(",")
        //   : [];

        // Fetch ChannelSegment and SalesFormat for each channelSegmentId
        // const channelSegments = await prisma.channelSegment.findMany({
        //   where: {
        //     id: {
        //       in: channelSegmentIds,
        //     },
        //   },
        //   include: {
        //     salesFormats: {
        //       include: {
        //         job: true, // `job` 관계를 포함
        //       },
        //     },
        //   },
        // });

        return {
          ...domain,
          // channelSegments, // Attach the fetched channelSegments
        };
      })
    );

    // Sentry.captureMessage("Domain Data fetched successfully");

    const response = NextResponse.json(
      { items: enrichedDomains },
      { status: 200 }
    );
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
