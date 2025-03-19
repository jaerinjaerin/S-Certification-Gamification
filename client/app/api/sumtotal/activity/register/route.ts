export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { refreshToken } from "@/services/api/refresh_token";
import { BadgeApiType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiType: BadgeApiType.REGISTER,
          activityId,
          userId,
          campaignId,
          domainId,
          status: 401,
          message: "Unauthorized(no session)",
        }),
      });
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!account) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiType: BadgeApiType.REGISTER,
          activityId,
          userId,
          campaignId,
          domainId,
          status: 404,
          message: "Account not found",
        }),
      });

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

        console.log("response", response);

        if (!response.ok) {
          const contentType = response.headers.get("content-type");

          let rawLog = "";
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log("Error response:", data);
            rawLog = JSON.stringify(data);
          } else {
            const text = await response.text(); // JSON이 아닐 경우 텍스트로 읽기
            console.log("Non-JSON error response:", text);
            rawLog = text;
          }

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                apiType: BadgeApiType.REGISTER,
                activityId,
                userId,
                campaignId,
                domainId,
                accountUserId: account.providerAccountId,
                accessToken: account.access_token,
                status: response.status,
                message: response.statusText || "Fail to register activity",
                rawLog,
              }),
            }
          );

          if (response.status === 401 && attempt === 0 && !isTokenRefreshed) {
            // Refresh the token if the first attempt fails with a 401
            if (account.refresh_token != null && account.refresh_token !== "") {
              console.log("Refreshing token...");
              try {
                accessToken = await refreshToken(
                  account.id,
                  account.refresh_token
                );

                isTokenRefreshed = true;
                continue; // Retry the request with the new token
              } catch (error) {
                console.error("Error refreshing token:", error);
                // let errorMessage = "Unknown error";
                // let errorStack = "No stack trace";
                // let errorName = "Error";

                // if (error instanceof Error) {
                //   // ② error가 Error 객체인지 확인
                //   errorMessage = error.message;
                //   errorStack = error.stack || "No stack trace";
                //   errorName = error.name;
                // } else if (typeof error === "string") {
                //   // ③ error가 문자열일 경우
                //   errorMessage = error;
                // } else if (typeof error === "object" && error !== null) {
                //   // ④ error가 객체인 경우
                //   errorMessage =
                //     (error as any).message || "Unknown object error";
                //   errorStack = (error as any).stack || "No stack trace";
                //   errorName = (error as any).name || "Error";
                // }

                // fetch(
                //   `${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`,
                //   {
                //     method: "POST",
                //     headers: {
                //       "Content-Type": "application/json",
                //     },
                //     body: JSON.stringify({
                //       apiType: BadgeApiType.REGISTER,
                //       status: 500,
                //       userId,
                //       campaignId,
                //       domainId,
                //       activityId,
                //       message: "An unexpected error occurred",
                //       rawLog: JSON.stringify({
                //         message: errorMessage,
                //         // stack: errorStack,
                //         name: errorName,
                //       }),
                //     }),
                //   }
                // );
              }
            }
          }

          throw new Error(
            `Failed to register activity: ${response.statusText}, ${session.user.id}, ${accessToken}`
          );
        }

        const data = await response.json();
        // console.log("api/register data", data);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiType: BadgeApiType.REGISTER,
            activityId,
            userId,
            campaignId,
            domainId,
            accessToken: account.access_token,
            accountUserId: account.providerAccountId,
            status: response.status,
            message:
              `${response.statusText} - isRegistered: ${data.isRegistered}` ||
              `success - isRegistered: ${data.isRegistered}`,
            rawLog: JSON.stringify(data),
          }),
        });

        // Sentry.captureMessage("response", data);

        if (data.isRegistered === false) {
          return NextResponse.json(data, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
      } catch (error) {
        console.error(`Error during attempt ${attempt + 1}:`, error);
        if (attempt === 1) {
          // let errorMessage = "Unknown error";
          // let errorStack = "No stack trace";
          // let errorName = "Error";

          // if (error instanceof Error) {
          //   // ② error가 Error 객체인지 확인
          //   errorMessage = error.message;
          //   errorStack = error.stack || "No stack trace";
          //   errorName = error.name;
          // } else if (typeof error === "string") {
          //   // ③ error가 문자열일 경우
          //   errorMessage = error;
          // } else if (typeof error === "object" && error !== null) {
          //   // ④ error가 객체인 경우
          //   errorMessage = (error as any).message || "Unknown object error";
          //   errorStack = (error as any).stack || "No stack trace";
          //   errorName = (error as any).name || "Error";
          // }

          // fetch(
          //   `${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`,
          //   {
          //     method: "POST",
          //     headers: {
          //       "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify({
          //       apiType: BadgeApiType.REGISTER,
          //       status: 500,
          //       userId,
          //       campaignId,
          //       domainId,
          //       activityId,
          //       message: "An unexpected error occurred",
          //       rawLog: JSON.stringify({
          //         message: errorMessage,
          //         // stack: errorStack,
          //         name: errorName,
          //       }),
          //     }),
          //   }
          // );

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

    // let errorMessage = "Unknown error";
    // let errorStack = "No stack trace";
    // let errorName = "Error";

    // if (error instanceof Error) {
    //   // ② error가 Error 객체인지 확인
    //   errorMessage = error.message;
    //   errorStack = error.stack || "No stack trace";
    //   errorName = error.name;
    // } else if (typeof error === "string") {
    //   // ③ error가 문자열일 경우
    //   errorMessage = error;
    // } else if (typeof error === "object" && error !== null) {
    //   // ④ error가 객체인 경우
    //   errorMessage = (error as any).message || "Unknown object error";
    //   errorStack = (error as any).stack || "No stack trace";
    //   errorName = (error as any).name || "Error";
    // }

    // fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sumtotal/activity/log`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     apiType: BadgeApiType.REGISTER,
    //     status: 500,
    //     userId,
    //     campaignId,
    //     domainId,
    //     activityId,
    //     message: "An unexpected error occurred",
    //     rawLog: JSON.stringify({
    //       message: errorMessage,
    //       // stack: errorStack,
    //       name: errorName,
    //     }),
    //   }),
    // });

    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
