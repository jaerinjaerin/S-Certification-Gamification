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

    const userQuizLog = await prisma.userQuizLog.update({
      where: {
        id: id,
      },
      data: body,
    });

    if (userQuizLog) {
      const userQuizStatistics = await prisma.userQuizStatistics.findFirst({
        where: {
          userId: userQuizLog.userId,
          quizSetId: userQuizLog.quizSetId,
        },
      });
      if (userQuizStatistics) {
        await prisma.userQuizStatistics.update({
          where: {
            id: userQuizStatistics.id,
          },
          data: body,
        });
      }
    }

    return NextResponse.json({ item: userQuizLog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
