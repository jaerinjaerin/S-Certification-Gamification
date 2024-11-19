import { NextRequest } from "next/server";

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
