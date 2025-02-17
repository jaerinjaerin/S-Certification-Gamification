export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { refreshToken } from "@/services/api/refresh_token";
import { BadgeApiType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { activityId, userId } = body as {
      activityId: string;
      userId: string;
    };

    const session = await auth();

    if (!session) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sumtotal/activity/log`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiType: BadgeApiType.REGISTER,
            activityId,
            userId,
            status: 401,
            message: "Unauthorized",
          }),
        }
      );
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!account) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sumtotal/activity/log`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiType: BadgeApiType.REGISTER,
            activityId,
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

    let accessToken = account.access_token;
    let isTokenRefreshed = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
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

        if (!response.ok) {
          if (response.status === 401 && attempt === 0 && !isTokenRefreshed) {
            // Refresh the token if the first attempt fails with a 401
            accessToken = await refreshToken(
              account.id,
              account.refresh_token || ""
            );

            isTokenRefreshed = true;
            continue; // Retry the request with the new token
          }

          throw new Error(
            `Failed to register activity: ${response.statusText}, ${session.user.id}, ${accessToken}`
          );
        }

        const data = await response.json();
        // console.log("api/register data", data);
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sumtotal/activity/log`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              apiType: BadgeApiType.REGISTER,
              activityId,
              userId,
              accountUserId: account.providerAccountId,
              status: response.status,
              message: response.statusText || "success",
              rawLog: JSON.stringify(data),
            }),
          }
        );

        Sentry.captureMessage("response", data);
        return NextResponse.json(data, { status: 200 });
      } catch (error) {
        console.error(`Error during attempt ${attempt + 1}:`, error);
        if (attempt === 1) {
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sumtotal/activity/log`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                apiType: BadgeApiType.REGISTER,
                activityId,
                userId,
                accountUserId: account.providerAccountId,
                accessToken,
                status: 500,
                message: "Fail to register activity",
                rawLog: JSON.stringify(error),
              }),
            }
          );

          // If the second attempt also fails, capture the error and return a failure response
          Sentry.captureException(error);
          return NextResponse.json(
            { message: "An unexpected error occurred" },
            { status: 500 }
          );
        }
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
