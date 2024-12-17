import { prisma } from "@/prisma-client";
import { Domain } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const domains = await prisma.domain.findMany();

    console.log("domains:", domains);

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

    const response = NextResponse.json(
      { items: enrichedDomains },
      { status: 200 }
    );
    response.headers.set("Cache-Control", "public, max-age=3600");
    return response;
  } catch (error) {
    console.error("Error Domain Data:", error);

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
