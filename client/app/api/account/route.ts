import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    const account = await prisma.account.findFirst({ where: { userId } });
    return NextResponse.json({ result: account }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
