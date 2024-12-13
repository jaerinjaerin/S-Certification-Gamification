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

    const log = await prisma.userQuizLog.update({
      where: {
        id: id,
      },
      data: body,
    });

    return NextResponse.json({ item: log }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
