import { CampaignDomainQuizSet } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    domain_id: string;
    job_id: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const domainId = props.params.domain_id;
    const jobId = props.params.job_id;
    if (!domainId || !jobId) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad request",
          error: {
            code: "BAD_REQUEST",
            details: "Invalid domain or job ID",
          },
        },
        { status: 400 }
      );
    }

    const campaignDomainQuizSets = await prisma.campaignDomainQuizSet.findMany({
      where: {
        domainId: domainId,
        jobId: jobId,
      },
    });

    if (!campaignDomainQuizSets.length) {
      return NextResponse.json(
        {
          status: 404,
          message: "Not found",
          error: {
            code: "NOT_FOUND",
            details: "No quiz sets found for the specified domain",
          },
        },
        { status: 404 }
      );
    }

    const languageIds = campaignDomainQuizSets.map(
      (cdqs: CampaignDomainQuizSet) => cdqs.languageId
    );
    const languages = await prisma.language.findMany({
      where: {
        id: {
          in: languageIds,
        },
      },
    });

    return NextResponse.json({ items: languages }, { status: 200 });
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
