import { defaultLanguageCode } from "@/app/core/config/default";
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
        id: body.domainId,
      },
    });

    let language = await prisma.language.findFirst({
      where: {
        code: body.languageCode,
      },
    });

    const job = await prisma.job.findFirst({
      where: {
        id: body.jobId,
      },
    });

    if (!language) {
      language = await prisma.language.findFirst({
        where: {
          code: defaultLanguageCode,
        },
      });
    }

    const languageCode = language?.code ?? defaultLanguageCode;

    await prisma.user.update({
      where: {
        id: session?.user.id,
      },
      data: {
        domainId: domain?.id,
        languageId: language!.id,
        jobId: body.jobId,
        regionId: body.regionId,
        subsidaryId: body.subsidaryId,
        storeId: body.storeId,
        storeSegmentText: body.storeSegmentText,
        channelId: body.channelId,
        channelSegmentId: body.channelSegmentId,
      },
      // include: {
      //   // domain: true,
      //   // language: true,
      //   job: true,
      // },
    });

    // if (user.domain == null || user.job == null) {
    if (domain == null || job == null) {
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
    // const quizPath = `${user.domain.code}_${user.job.code}_${languageCode}`;
    const quizPath = `${domain?.code}_${job?.code}_${languageCode}`;

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
