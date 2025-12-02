export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { refreshToken } from "@/services/api/refresh_token";
import { BadgeApiType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { createBadgeLog, extractRawLogFromResponse } from "../_lib/log";

export async function POST(request: Request) {
  const body = await request.json();
  const { activityId, userId, campaignId, domainId } = body as {
    activityId: string;
    userId: string;
    campaignId: string;
    domainId: string;
  };

  try {
    const session = await auth();

    if (!session) {
      createBadgeLog({
        apiType: BadgeApiType.REGISTER,
        activityId,
        userId,
        campaignId,
        domainId,
        status: 401,
        message: "Unauthorized(no session)",
      });
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!account) {
      createBadgeLog({
        apiType: BadgeApiType.REGISTER,
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

    let accessToken = account.access_token;
    let isTokenRefreshed = false;

    const tryNumber = 2;
    for (let attempt = 0; attempt < tryNumber; attempt++) {
      const response = await fetch(
        `https://samsung.sumtotal.host/apis/api/v1/users/activities/${activityId}/register`,
        {
          method: "PUT",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("response", response);

      // 성공 처리
      if (response.ok) {
        const data = await response.json();
        const isRegistered = data?.isRegistered;
        const status = isRegistered ? response.status : 422;

        createBadgeLog({
          apiType: BadgeApiType.REGISTER,
          activityId,
          userId,
          campaignId,
          domainId,
          accessToken,
          accountUserId: account.providerAccountId,
          status,
          message:
            `${response.statusText} - isRegistered: ${data.isRegistered}` ||
            `success - isRegistered: ${data.isRegistered}`,
          rawLog: JSON.stringify(data),
        });

        if (data?.isRegistered === false) {
          return NextResponse.json(data, { status: 422 });
        }

        return NextResponse.json(data, { status: 200 });
      }

      // 실패 처리
      const rawLog = await extractRawLogFromResponse(response);
      createBadgeLog({
        apiType: BadgeApiType.REGISTER,
        activityId,
        userId,
        campaignId,
        domainId,
        accountUserId: account.providerAccountId,
        accessToken,
        status: response.status,
        message: response.statusText || "Fail to register activity",
        rawLog,
      });

      // Accesstoken 만료 처리 (loop를 돌면서 1회만 refresh)
      if (response.status === 401 && attempt === 0 && !isTokenRefreshed) {
        if (account.refresh_token != null && account.refresh_token !== "") {
          console.log("Refreshing token...");
          try {
            accessToken = await refreshToken(account.id, account.refresh_token);

            isTokenRefreshed = true;
            continue; // Retry the request with the new token
          } catch (error) {
            console.error("Error refreshing token:", error);
          }
        }
      }

      const isLastAttempt = attempt === tryNumber - 1;
      if (isLastAttempt) {
        return NextResponse.json(
          { message: "Fail to register activity" },
          { status: response.status }
        );
      }
    }
  } catch (error) {
    console.error("Error in PUT handler:", error);

    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
