import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";
type Props = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, props: Props) {
  try {
    const id = props.params.id;
    const body = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      const userQuizLog = await tx.userQuizLog.update({
        where: {
          id: id,
        },
        data: body,
      });

      const userQuizStatistics = await tx.userQuizStatistics.update({
        where: {
          id: id,
        },
        data: body,
      });

      return { userQuizLog, userQuizStatistics };
    });

    return NextResponse.json({ item: result.userQuizLog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
