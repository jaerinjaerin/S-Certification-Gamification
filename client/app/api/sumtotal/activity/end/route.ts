export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { BadgeApiType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import {
  createBadgeLog,
  extractRawLogFromResponse,
  normalizeError,
} from "../_lib/log";

export async function POST(request: Request) {
  const body = await request.json();
  const { activityId, status, elapsedSeconds, userId, campaignId, domainId } =
    body as {
      userId: string;
      campaignId: string;
      domainId: string;
      activityId: string;
      status: string;
      elapsedSeconds: number;
    };

  try {
    const session = await auth();

    if (!session) {
      createBadgeLog({
        apiType: BadgeApiType.PROGRESS,
        activityId,
        userId,
        campaignId,
        domainId,
        status: 401,
        message: "Unauthorized",
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
      createBadgeLog({
        apiType: BadgeApiType.PROGRESS,
        activityId,
        userId,
        campaignId,
        domainId,
        status: 404,
        message: "Account not found",
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

    const accessToken = account.access_token;

    const tryNumber = 2;
    for (let attempt = 0; attempt < tryNumber; attempt++) {
      const response = await fetch(
        `https://samsung.sumtotal.host/apis/api/v1/learner/activities/${activityId}/progress`,
        {
          method: "PUT",
          cache: "no-store",
          body: JSON.stringify({
            status,
            date: updatedTime.toISOString(),
            elapsedSeconds,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        createBadgeLog({
          apiType: BadgeApiType.PROGRESS,
          activityId,
          userId,
          campaignId,
          domainId,
          accountUserId: account.providerAccountId,
          accessToken,
          status: response.status,
          message: response.statusText || "success",
          rawLog: JSON.stringify(data),
        });

        return NextResponse.json(data, { status: 200 });
      }

      const rawLog = await extractRawLogFromResponse(response);
      createBadgeLog({
        apiType: BadgeApiType.PROGRESS,
        activityId,
        userId,
        campaignId,
        domainId,
        accountUserId: account.providerAccountId,
        accessToken,
        status: response.status,
        message: response.statusText || "Failed to update activity/progress",
        rawLog,
      });

      const isLastAttempt = attempt === tryNumber - 1;
      if (isLastAttempt) {
        return NextResponse.json(
          {
            message:
              response.statusText || "Failed to update activity/progress",
          },
          { status: response.status }
        );
      }
    }
  } catch (error) {
    console.error("Error end activity:", error);
    const { name, message } = await normalizeError(error);
    createBadgeLog({
      apiType: BadgeApiType.PROGRESS,
      status: 500,
      userId,
      activityId,
      campaignId,
      domainId,
      message: "Fail to progress activity",
      rawLog: JSON.stringify({
        message,
        name,
      }),
    });

    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
