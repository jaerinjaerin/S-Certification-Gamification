import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    /*
    body: {
      domainCode: selectedCountry.code,
      subsidaryId: selectedCountry.subsidaryId,
      regionId: selectedCountry.regionId,
      jobId: selectedJobId,
      languageCode: languageCode,
      channelSegmentId: selectedChannelSegmentId,
    }
    */

    const domain = await prisma.domain.findFirst({
      where: {
        code: body.domainCode,
      },
    });

    const language = await prisma.language.findFirst({
      where: {
        code: body.languageCode,
      },
    });

    const user = await prisma.user.update({
      where: {
        id: session?.user.id,
      },
      data: {
        domainId: domain?.id,
        languageId: language?.id ?? "en-US",
        jobId: body.jobId,
        regionId: body.regionId,
        subsidaryId: body.subsidaryId,
        channelSegmentId: body.channelSegmentId,
        storeId: body.storeId,
        channelId: body.channelId,
      },
      include: {
        domain: true,
        language: true,
        job: true,
      },
    });

    if (user.domain == null || user.job == null || user.language == null) {
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
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
