export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { BadgeApiType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { activityId, status, elapsedSeconds, userId } = body as {
    userId: string;
    activityId: string;
    status: string;
    elapsedSeconds: number;
  };

  try {
    const session = await auth();

    if (!session) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiType: BadgeApiType.PROGRESS,
          activityId,
          userId,
          status: 401,
          message: "Unauthorized",
        }),
      });
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // console.log("session", session);

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    // console.log("account", account);

    if (!account) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiType: BadgeApiType.PROGRESS,
          activityId,
          userId,
          status: 404,
          message: "Account not found",
        }),
      });

      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    const now = new Date(); // 현재 시간
    const updatedTime = elapsedSeconds
      ? new Date(now.getTime() - elapsedSeconds * 1000)
      : new Date();

    // try {
    const response = await fetch(
      `https://samsung.sumtotal.host/apis/api/v1/learner/activities/${activityId}/progress`,
      {
        method: "PUT",
        // mode: 'no-cors',
        cache: "no-store",
        body: JSON.stringify({
          status,
          date: updatedTime.toISOString(),
          elapsedSeconds,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.access_token}`, // 액세스 토큰 사용
        },
      }
    );

    // console.log("activity/progress response", response);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "activity/progress response",
        response,
        account.userId,
        account.providerAccountId,
        account.access_token
      );

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiType: BadgeApiType.PROGRESS,
          activityId,
          userId,
          accountUserId: account.providerAccountId,
          accessToken: account.access_token,
          status: response.status,
          message: response.statusText || "Failed to update activity/progress",
          rawLog: JSON.stringify(errorData),
        }),
      });

      return NextResponse.json(
        {
          message: response.statusText || "Failed to update activity/progress",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    // console.log("data", data);
    Sentry.captureMessage("response", data);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiType: BadgeApiType.PROGRESS,
        activityId,
        userId,
        accountUserId: account.providerAccountId,
        accessToken: account.access_token,
        status: response.status,
        message: response.statusText || "success",
        rawLog: JSON.stringify(data),
      }),
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error end activity:", error);
    let errorMessage = "Unknown error";
    let errorStack = "No stack trace";
    let errorName = "Error";

    if (error instanceof Error) {
      // ② error가 Error 객체인지 확인
      errorMessage = error.message;
      errorStack = error.stack || "No stack trace";
      errorName = error.name;
    } else if (typeof error === "string") {
      // ③ error가 문자열일 경우
      errorMessage = error;
    } else if (typeof error === "object" && error !== null) {
      // ④ error가 객체인 경우
      errorMessage = (error as any).message || "Unknown object error";
      errorStack = (error as any).stack || "No stack trace";
      errorName = (error as any).name || "Error";
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiType: BadgeApiType.PROGRESS,
        status: 500,
        userId,
        activityId,
        message: "An unexpected error occurred",
        rawLog: JSON.stringify({
          message: errorMessage,
          stack: errorStack,
          name: errorName,
        }),
      }),
    });
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
