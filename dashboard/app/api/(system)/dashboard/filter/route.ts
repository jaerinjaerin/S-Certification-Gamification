import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();

    // const { searchParams } = request.nextUrl;

    const data: AllFilterData = {
      campaign: [],
      userGroup: {
        all: {
          name: "All",
          id: "all",
        },
        plus: { name: "S+ User", id: "plus" },
        none: {
          name: "Non S+ User",
          id: "none",
        },
      },
      filters: {
        regions: [],
        subsidiary: [],
        domain: [],
        channelSegment: [],
        salesFormat: [],
        jobGroup: [],
      },
    };

    data.campaign = await prisma.campaign.findMany({});
    // Fetch regions (always fetch all regions)
    data.filters.regions = await prisma.region.findMany({});
    data.filters.subsidiary = await prisma.subsidiary.findMany({});
    data.filters.domain = await prisma.domain.findMany({});
    // Fetch other data
    data.filters.channelSegment = await prisma.channelSegment.findMany({});
    data.filters.jobGroup = await prisma.job.findMany({});
    data.filters.salesFormat = await prisma.store.findMany({});

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}
