export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function GET() {
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

    // try {
    const response = await fetch(
      `https://samsung.sumtotal.host/apis/api/v1/domains?limit=300`,
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
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
