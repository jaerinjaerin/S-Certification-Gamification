import { prisma } from "@/prisma-client";
import { extractCodesFromPath } from "@/utils/pathUtils";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.url;

    // URL 객체 생성
    const { searchParams } = new URL(url);
    // const quizsetPath = props.params.quizset_path;
    const userId = searchParams.get("user_id");
    const quizsetPath = searchParams.get("quizset_path");

    if (!userId || !quizsetPath) {
      Sentry.captureMessage("User ID is required");
      return NextResponse.json(
        {
          status: 400,
          message: "Bad request",
          error: {
            code: "BAD_REQUEST",
            details: "User ID is required",
          },
        },
        { status: 400 }
      );
    }

    const { domainCode, jobCode /* languageCode */ } = extractCodesFromPath(quizsetPath);

    const domain = await prisma.domain.findFirst({
      where: {
        code: domainCode,
      },
    });

    // const job = await prisma.job.findFirst({
    //   where: {
    //     code: jobCode,
    //   },
    // });

    const quizSet = await prisma.quizSet.findFirst({
      where: {
        domainId: domain?.id,
        jobCodes: {
          has: jobCode,
        },
      },
      include: {
        quizStages: true, // Include quizStages
      },
    });

    if (!quizSet) {
      return NextResponse.json(
        {
          status: 404,
          message: "Quiz set not found",
          error: {
            code: "NOT_FOUND",
            details: "Quiz set not found",
          },
        },
        { status: 404 }
      );
    }

    const userQuizLog = await prisma.userQuizLog.findFirst({
      where: {
        userId: userId,
        campaignId: quizSet.campaignId,
        // jobId: quizSet.jobId,
        // domainId: quizSet.domainId,
      },
    });

    const userQuizStageLogs = await prisma.userQuizStageLog.findMany({
      where: {
        quizSetId: userQuizLog?.quizSetId,
        userId: userId,
      },
    });

    const userQuizQuestionLogs = await prisma.userQuizQuestionLog.findMany({
      where: {
        quizSetId: userQuizLog?.quizSetId,
        userId: userId,
      },
      orderBy: {
        createdAt: "asc", // 오름차순 정렬
      },
    });

    return NextResponse.json(
      {
        item: {
          quizLog: userQuizLog,
          quizStageLogs: userQuizStageLogs,
          quizQuestionLogs: userQuizQuestionLogs,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching activity data:", error);
    Sentry.captureException(error);

    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

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

export async function POST(request: NextRequest) {
  try {
    const url = request.url;
    const { searchParams } = new URL(url);
    const quizsetPath = searchParams.get("quizset_path");
    console.log("quizSet post", quizsetPath);

    if (!quizsetPath) {
      Sentry.captureMessage("Quiz set path is required");
      return NextResponse.json(
        {
          status: 400,
          message: "Bad request",
          error: {
            code: "BAD_REQUEST",
            details: "Quiz set path is required",
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("body", body);
    const { userId } = body;

    const { domainCode, jobCode, languageCode } = extractCodesFromPath(quizsetPath);

    console.log("domainCode", domainCode);
    console.log("jobCode", jobCode);
    console.log("languageCode", languageCode);

    const domain = await prisma.domain.findFirst({
      where: {
        code: domainCode,
      },
      include: {
        subsidary: {
          include: {
            region: true,
          },
        },
      },
    });

    console.log("domain:", domain);

    // const job = await prisma.job.findFirst({
    //   where: {
    //     code: jobCode,
    //   },
    // });

    const job = await prisma.job.findFirst({
      where: {
        code: jobCode,
      },
    });

    console.log("job:", job);

    const language = await prisma.language.findFirst({
      where: {
        code: languageCode,
      },
    });

    console.log("language:", language);

    const quizSet = await prisma.quizSet.findFirst({
      where: {
        domainId: domain?.id,
        jobCodes: {
          has: jobCode,
        },
      },
      include: {
        quizStages: true, // Include quizStages
      },
    });

    console.log("quizSet:", quizsetPath, quizSet);

    if (!quizSet) {
      return NextResponse.json(
        {
          status: 404,
          message: "Not found",
          error: {
            code: "NOT_FOUND",
            details: "Quiz set not found",
          },
        },
        { status: 404 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    console.log("user:", user);

    const userQuizLog = await prisma.userQuizLog.create({
      data: {
        userId: userId,
        campaignId: quizSet.campaignId,
        // badgeStages: quizSet.badgeStages,
        // firstBadgeStage: quizSet.badgeStages,
        // isFirstBadgeStageCompleted: false,
        isCompleted: false,
        isBadgeAcquired: false,
        jobId: user?.sumtotalJobId ?? job?.id,
        quizSetId: quizSet.id,
        domainId: domain?.id,
        // firstBadgeActivityId: quizSet.firstBadgeActivityId,
        // lastBadgeActivityId: quizSet.lastBadgeActivityId,
        languageId: language?.id,
        quizSetPath: quizsetPath,

        regionId: domain?.subsidary?.region?.id ?? user?.regionId,
        subsidaryId: domain?.subsidary?.id ?? user?.subsidaryId,
        channelSegmentId: user?.channelSegmentId,
        storeId: user?.storeId,
        channelId: user?.channelId,

        // regionId String?
        // subsidaryId String?
        // channelSegmentId String?
        // storeId String?
        // channelId String?
      },
    });

    console.log("userQuizLog:", userQuizLog);

    const userQuizStageLogs = await prisma.userQuizStageLog.findMany({
      where: {
        quizSetId: userQuizLog?.quizSetId,
        userId: userId,
      },
    });

    const userQuizQuestionLogs = await prisma.userQuizQuestionLog.findMany({
      where: {
        quizSetId: userQuizLog?.quizSetId,
        userId: userId,
      },
    });

    console.log("userQuizStageLogs:", userQuizStageLogs);

    return NextResponse.json(
      {
        item: {
          quizLog: userQuizLog,
          quizStageLogs: userQuizStageLogs,
          quizQuestionLogs: userQuizQuestionLogs,
        },
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Error creating user campaign domain log:", e);
    Sentry.captureException(e);
    return NextResponse.json({ error: e }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
