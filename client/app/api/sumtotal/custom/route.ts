export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiPath = searchParams.get("api_path");

    if (!apiPath) {
      return NextResponse.json(
        { message: "API path is required" },
        { status: 400 }
      );
    }

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

    // Build query string for the fetch call
    const fetchSearchParams = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (key !== "api_path") {
        fetchSearchParams.append(key, value);
      }
    }

    // Conditionally append query string if it's not empty
    const queryString = fetchSearchParams.toString();
    const fetchUrl = queryString
      ? `https://samsung.sumtotal.host/apis/${apiPath}?${queryString}`
      : `https://samsung.sumtotal.host/apis/${apiPath}`;

    const response = await fetch(fetchUrl, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${account.access_token}`,
      },
    });

    console.log("fetchUrl", fetchUrl);
    console.log("response", response);

    if (!response.ok) {
      return NextResponse.json(
        { message: response.statusText || "Failed to fetch activities" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("data", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error call api:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
