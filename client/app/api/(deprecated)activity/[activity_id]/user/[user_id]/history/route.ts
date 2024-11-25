import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    activity_id: string;
    user_id: string;
    domain_name: string;
    job_name: string;
    // lang_id: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const activityId = props.params.activity_id;

    const userCampaignDomainLog = await prisma.userCampaignDomainLog.findFirst({
      where: {
        activityId: activityId,
      },
    });

    return NextResponse.json({ item: userCampaignDomainLog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching activity data:", error);

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

export async function POST(request: NextRequest, props: Props) {
  try {
    const activityId = props.params.activity_id;
    const userId = props.params.user_id;

    const body = await request.json();
    const languageCode = body.languageCode;
    const jobName = body.jobName;

    console.log("activityId", activityId, !activityId, typeof activityId);

    if (
      activityId == null ||
      activityId == "undefined" ||
      activityId == "null"
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing required parameters",
          error: {
            code: "BAD_REQUEST",
            details: "activity_id is required",
          },
        },
        { status: 400 }
      );
    }

    if (userId == null || userId == "undefined" || userId == "null") {
      return NextResponse.json(
        {
          status: 400,
          message: "Missing required parameters",
          error: {
            code: "BAD_REQUEST",
            details: "user_id is required",
          },
        },
        { status: 400 }
      );
    }

    const campaignDomain = await prisma.campaignDomain.findFirst({
      where: {
        activityId: activityId,
      },
    });

    if (!campaignDomain) {
      return NextResponse.json(
        {
          status: 404,
          message: "Campaign domain not found",
          error: {
            code: "NOT_FOUND",
            details:
              "The quiz isn't ready just yet. Please hold on for a moment. Thank you for your patience!",
          },
        },
        { status: 404 }
      );
    }

    const job =
      jobName == null
        ? null
        : await prisma.job.findFirst({
            where: {
              name: jobName,
            },
          });

    const item = await prisma.userCampaignDomainLog.create({
      data: {
        activityId: activityId,
        userId: userId,
        completed: false,
        campaignId: campaignDomain.campaignId,
        campaignDomainId: campaignDomain.id,
        domainId: campaignDomain.domainId,
        // languageId: domain.languageId,
        jobId: job?.id ?? null,
        // ...body,
      },
    });

    return NextResponse.json({ item }, { status: 200 });
  } catch (e: any) {
    console.error("Error creating user campaign domain log:", e);
    return NextResponse.json({ error: e.error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
