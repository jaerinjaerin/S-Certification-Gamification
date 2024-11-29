// app/api/users/[userId]/activities/route.ts
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

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: body,
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
