import { auth } from "@/auth";
import { defaultLanguageCode } from "@/core/config/default";
import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

type Props = {
  params: {
    user_id: string;
  };
};

export async function POST(request: Request, props: Props) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = props.params.user_id;
  // const session = await auth();
  const body = await request.json();
  const {
    domainId,
    // domainCode,
    subsidiaryId,
    regionId,
    jobId,
    storeId,
    languageCode,
    channelId,
    channelName,
    channelSegmentId,
    campaignId,
    campaignSlug,
  } = body;

  try {
    /*
    body: {
      domainCode: selectedCountry.code,
      subsidiaryId: selectedCountry.subsidiaryId,
      regionId: selectedCountry.regionId,
      jobId: selectedJobId,
      languageCode: languageCode,
      channelSegmentId: selectedChannelSegmentId,
    }
    */

    const domain = await prisma.domain.findFirst({
      where: {
        id: domainId,
      },
    });

    if (!domain) {
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

    if (campaignSlug.toLowerCase() !== "s25") {
      const language = await prisma.language.findFirst({
        where: {
          code: languageCode,
        },
      });

      if (!language) {
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

      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
        },
      });

      if (!job) {
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

      // const languageCode = language?.code ?? defaultLanguageCode;

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          domainId,
          domainCode: domain.code,
          languageId: language.id,
          jobId: job.id,
          regionId: regionId,
          subsidiaryId: subsidiaryId,
          storeId: storeId,
          // storeSegmentText: body.storeSegmentText,
          channelId: channelId,
          channelName: channelName,
          channelSegmentId: channelSegmentId,
        },
      });

      // if (user.domain == null || user.job == null) {
      // if (domain == null || job == null) {
      //   return NextResponse.json(
      //     {
      //       status: 404,
      //       message: "Not found",
      //       error: {
      //         code: "NOT_FOUND",
      //         details: "Fail create quiz path",
      //       },
      //     },
      //     { status: 404 }
      //   );
      // }

      const quizSet = await prisma.quizSet.findMany({
        where: {
          domainId: domainId,
          languageId: language.id,
          jobCodes: { has: job.code },
        },
      });

      if (!quizSet) {
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

      const quizPath = `${domain.code}_${languageCode}`;
      return NextResponse.json({ item: quizPath }, { status: 200 });
    }

    // DEPRECATED: 구버전 (S25) 캠페인 로직입니다.
    // 대체 로직은 위의 로직을 사용
    let language = await prisma.language.findFirst({
      where: {
        code: languageCode,
      },
    });

    if (!language) {
      language = await prisma.language.findFirst({
        where: {
          code: defaultLanguageCode,
        },
      });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
      },
    });

    // const languageCode = language?.code ?? defaultLanguageCode;

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        domainId,
        domainCode: domain.code,
        languageId: language!.id,
        jobId: job?.id,
        regionId: regionId,
        subsidiaryId: subsidiaryId,
        storeId: storeId,
        // storeSegmentText: body.storeSegmentText,
        channelId: channelId,
        channelName: channelName,
        channelSegmentId: channelSegmentId,
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
    // const quizPath = `${domain?.code}_${job?.code}_${languageCode}`;

    const quizPath = `${domain?.code}_${languageCode}`;
    return NextResponse.json({ item: quizPath }, { status: 200 });
  } catch (error) {
    console.error("Error register user quiz log:", error);

    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/users/[user_id]/register",
        method: "POST",
        description: "Failed to register user quiz log",
      });
      scope.setTag("userId", userId);
      scope.setTag("domainId", domainId);
      scope.setTag("regionId", regionId);
      scope.setTag("subsidiaryId", subsidiaryId);
      scope.setTag("jobId", jobId);
      scope.setTag("storeId", storeId);
      scope.setTag("languageCode", languageCode);
      scope.setTag("channelId", channelId);
      scope.setTag("channelSegmentId", channelSegmentId);
      return scope;
    });
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
