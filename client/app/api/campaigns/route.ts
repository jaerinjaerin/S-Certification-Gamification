import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function GET(request: Request) {
  // console.warn("GET /api/campaigns");
  const { searchParams } = new URL(request.url);
  const campaignName = searchParams.get("campaign_name");

  if (!campaignName) {
    Sentry.captureMessage("Missing required parameter: campaign_name");
    return NextResponse.json(
      { message: "Missing required parameter: campaign_name" },
      { status: 400 }
    );
  }

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        name: {
          equals: campaignName,
          mode: "insensitive", // 대소문자 구분 없이 검색
        },
      },
    });

    if (campaign == null) {
      Sentry.captureMessage(`Campaign not found: ${campaignName}`);
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: campaign }, { status: 200 });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
