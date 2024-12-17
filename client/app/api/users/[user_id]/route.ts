import { prisma } from "@/prisma-client";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { NextResponse } from "next/server";

type Props = {
  params: {
    user_id: string;
  };
};

export async function PUT(request: Request, props: Props) {
  try {
    const userId = props.params.user_id;
    const body = await request.json();
    const { quizset_path } = body;
    const { domainCode, jobCode, languageCode } =
      extractCodesFromPath(quizset_path);

    const domain = await prisma.domain.findFirst({
      where: {
        code: domainCode,
      },
    });

    const job = await prisma.job.findFirst({
      where: {
        code: jobCode,
      },
    });

    const language = await prisma.job.findFirst({
      where: {
        code: languageCode,
      },
    });

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        jobId: job?.id,
        domainId: domain?.id,
        languageId: language?.id,
      },
    });

    return NextResponse.json({ item: user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
