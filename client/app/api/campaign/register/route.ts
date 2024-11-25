import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    const user = await prisma.user.update({
      where: {
        id: session?.user.id,
      },
      data: body,
      include: {
        domain: true,
        language: true,
        job: true,
      },
    });

    if (user.domain == null || user.job == null || user.language == null) {
      return NextResponse.json(
        {
          status: 404,
          message: "Not found",
          error: {
            code: "NOT_FOUND",
            details: "Fail create quiz path",
          },
        },
        { status: 404 }
      );
    }
    const quizPath = `${user.domain.code}_${user.job.code}_${user.language.code}`;

    return NextResponse.json({ item: quizPath }, { status: 200 });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
