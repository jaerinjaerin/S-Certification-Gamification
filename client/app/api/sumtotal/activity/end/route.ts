export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { BadgeApiType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activityId, status, elapsedSeconds, userId } = body as {
      userId: string;
      activityId: string;
      status: string;
      elapsedSeconds: number;
    };

    const session = await auth();

    if (!session) {
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
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sumtotal/activity/log`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiType: BadgeApiType.PROGRESS,
            userId,
            status: 404,
            message: "Account not found",
          }),
        }
      );

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
      // const errorData = await response.json();
      console.error(
        "activity/progress response",
        response,
        account.userId,
        account.providerAccountId,
        account.access_token
      );

      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sumtotal/activity/log`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiType: BadgeApiType.PROGRESS,
            activityId,
            userId,
            accountUserId: account.providerAccountId,
            status: response.status,
            message:
              response.statusText || "Failed to update activity/progress",
            rawLog: JSON.stringify(response),
          }),
        }
      );

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

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sumtotal/activity/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiType: BadgeApiType.PROGRESS,
        activityId,
        userId,
        accountUserId: account.providerAccountId,
        status: response.status,
        message: response.statusText || "success",
        rawLog: JSON.stringify(data),
      }),
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error end activity:", error);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sumtotal/activity/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiType: BadgeApiType.PROGRESS,
        status: 500,
        message: "An unexpected error occurred",
        rawLog: JSON.stringify(error),
      }),
    });

    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
