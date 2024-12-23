export const dynamic = "force-dynamic";
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

    console.log("session", session);

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    console.log("account", account);

    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { activityId, status, elapsedSeconds } = body as {
      activityId: string;
      status: string;
      elapsedSeconds: number;
    };

    // try {
    const response = await fetch(
      `https://samsung.sumtotal.host/apis/api/v1/learner/activities/${activityId}/progress`,
      {
        method: "PUT",
        // mode: 'no-cors',
        cache: "no-store",
        body: JSON.stringify({
          status,
          date: new Date().toISOString(),
          elapsedSeconds,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.access_token}`, // 액세스 토큰 사용
          // Authorization:
          //   'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkEwQjVCMUFCMTUzMjI1MzRDNUIxQUU3QTdEMjZDRkI3NDYzNTIwMzNSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6Im9MV3hxeFV5SlRURnNhNTZmU2JQdDBZMUlETSJ9.eyJuYmYiOjE3MzEzMDMyMzMsImV4cCI6MTczMTMxMDQzMywiaXNzIjoiaHR0cHM6Ly9zYW1zdW5nLnN1bXRvdGFsLmhvc3QvYXBpc2VjdXJpdHkiLCJhdWQiOlsiZXh0YXBpcyIsImh0dHBzOi8vc2Ftc3VuZy5zdW10b3RhbC5ob3N0L2FwaXNlY3VyaXR5L3Jlc291cmNlcyJdLCJjbGllbnRfaWQiOiJTQU1TVU5HRUxFQ1RST05JQ1NfUFJPRF9hOGUxNGVkZTI5Mjk0OWM5OGNiZmU3NzllZGIyZGFhYyIsInN1YiI6ImhxX2FwaS50ZXN0MSIsImF1dGhfdGltZSI6MTczMTMwMjk0NCwiaWRwIjoibG9jYWwiLCJuYW1lIjoiaHFfYXBpLnRlc3QxIiwidXNlcm5hbWUiOiJocV9hcGkudGVzdDEiLCJtYXNrZWR1c2VyaWQiOiIyM0UzOEI2NEU0NjgwRTBBQkZBM0JDQjBGNjg3NURCNiIsInJvbGUiOiJQb3J0YWwgVXNlciIsInRlbmFudCI6IlNBTVNVTkdFTEVDVFJPTklDU19QUk9EIiwiYnJva2Vyc2Vzc2lvbiI6ImQ5MzU3N2RkZjY5NTQ2NzBiYjc0OTg4NWQ1NWExMThhIiwiY3VsdHVyZSI6ImVuLVVTIiwibGFuZ3VhZ2UiOiJlbi11cyIsImRhdGVmb3JtYXQiOiJNTS9kZC95eXl5IiwidGltZWZvcm1hdCI6ImhoOm1tIGEiLCJ1c2VyaWQiOiIyMTM1MTU2IiwicGVyc29ucGsiOiIxNDg0MjAzIiwiZ3Vlc3RhY2NvdW50IjoiMCIsInVzZXJ0aW1lem9uZWlkIjoiQXNpYS9TZW91bCIsInR3b0xldHRlcklTT0xhbmd1YWdlTmFtZSI6ImVuIiwiaXNydGwiOiJGYWxzZSIsInBlcnNvbmd1aWQiOiI0ZjM3YjM0Mi0wZjYyLTQxMzItOTM1MS0wMGYzN2NhNTMzM2EiLCJ1c2VyaWRoYXNoIjoiMTg5Nzk0NDQyMyIsIndmbXVzZXIiOiJUcnVlIiwicHJvcGVybmFtZSI6IlRlc3QrVGVzdCIsImp0aSI6IjVCMzkzMTUwRTI2REFBMTU4RTNGMjhCMjM2QUI2QTc0IiwiaWF0IjoxNzMxMzAzMjMzLCJzY29wZSI6WyJhbGxhcGlzIl0sImFtciI6WyJwd2QiXX0.xZw6ogWCaTNtX0Zo4bbkT-_e-6-wC0KrNWZd5oNWiPrQIpFJlPZy-gjlh2yc2ukq6jFiXxlS58LaEs6OqIcjKomYRjIiuLJxxAdmjpB4ZmEFqjNyufVvGamNilV7aCCaX_Ru76uTSqDxP0sleo85qtY0LzknBKzr4EcNNGoLhSn1TgXUGKtcMphpwPg_Yomkdnp3rXDxI62n_-EYInUNnrtAFBgCG3tKkQnv9-lAv3olnxUHKL1L9MUKsroKsTyNIbM82QhU1LCCo7YktK97cQ5sNiMYNtWQ9iSEIxtUX33sz7ff2copMhGNk77gCcLsMxO9Jtk2T_iC7xMaUP09gA', // 액세스 토큰 사용
        },
      }
    );

    console.log("response", response);

    if (!response.ok) {
      // const errorData = await response.json();
      return NextResponse.json(
        { message: response.statusText || "Failed to fetch activities" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("data", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching activitie:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
