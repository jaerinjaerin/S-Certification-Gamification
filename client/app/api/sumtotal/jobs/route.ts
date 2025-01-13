export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  try {
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
      Sentry.captureException(new Error("Account not found"), (scope) => {
        scope.setContext("operation", {
          type: "api",
          endpoint: "/api/users/job",
          method: "POST",
          description: "Account not found",
        });
        scope.setTag("userId", session.user.id);
        return scope;
      });

      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    // try {
    const response = await fetch(
      `https://samsung.sumtotal.host/apis/api/v1/jobs`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.access_token}`, // 액세스 토큰 사용
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
  } catch (error: unknown) {
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/users/job",
        method: "POST",
        description: "Failed to fetch job data",
      });
      scope.setTag("userId", session?.user.id);
      return scope;
    });
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
