import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "Missing required parameter: userId" },
      { status: 400 }
    );
  }

  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
      },
    });

    if (account == null) {
      console.error("Acc count not found", userId);
      return NextResponse.json(
        { message: "Account not found" },
        { status: 401 }
      );
    }

    if (account.expires_at == null) {
      console.error("Account has no expiry date", userId);
      return NextResponse.json(
        { message: "Account has no expiry date" },
        { status: 401 }
      );
    }

    const expiresAt = new Date(account.expires_at * 1000);
    if (expiresAt < new Date()) {
      console.error("Account has expired", userId, expiresAt);
      return NextResponse.json(
        { message: "Account has expired" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Account is still valid" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
