import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

type Props = {
  params: {
    user_id: string;
  };
};

export async function GET(request: Request, props: Props) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = props.params.user_id;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ item: user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
