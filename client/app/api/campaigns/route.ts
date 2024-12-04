import { prisma } from "@/prisma-client";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignName = searchParams.get("campaign_name");

  if (!campaignName) {
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
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: campaign }, { status: 200 });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
