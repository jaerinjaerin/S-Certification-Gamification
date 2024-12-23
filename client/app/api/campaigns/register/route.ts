import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

type Props = {
  params: {
    user_id: string;
  };
};

export async function POST(request: Request, props: Props) {
  try {
    const userId = props.params.user_id;
    // const session = await auth();
    const body = await request.json();

    /*
    body: {
      domainId: selectedDomain?.id,
      jobId: selectedSalesFormat?.jobId,
      languageId: selectedLanguage?.id,
      channelSegmentId: selectedChannel?.id,
      salesFormatId: selectedSalesFormat?.id,
    }
    */

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: body,
      include: {
        domain: true,
        language: true,
        job: true,
      },
    });

    if (user.domain == null || user.job == null || user.language == null) {
      Sentry.captureMessage("Fail create quiz path");
      return NextResponse.json(
        {
          status: 404,
          message: "Not found",
          error: {
            code: "NOT_FOUND",
            details: "Fail create quiz path",
          },
        },
        { status: 404 }
      );
    }
    const quizPath = `${user.domain.code}_${user.job.code}_${user.language.code}`;

    return NextResponse.json({ item: quizPath }, { status: 200 });
  } catch (error) {
    console.error("Error register user quiz log:", error);
    Sentry.captureMessage("Question not found");
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
