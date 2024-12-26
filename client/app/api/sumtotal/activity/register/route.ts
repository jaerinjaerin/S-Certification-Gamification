export const dynamic = "force-dynamic";
import { refreshToken } from "@/app/lib/api/refresh_token";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { activityId } = body as { activityId: string };

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
          throw new Error(`Failed to fetch activities: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("data", data);
        return NextResponse.json(data, { status: 200 });
      } catch (error) {
        console.error(`Error during attempt ${attempt + 1}:`, error);
        if (attempt === 1) {
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
