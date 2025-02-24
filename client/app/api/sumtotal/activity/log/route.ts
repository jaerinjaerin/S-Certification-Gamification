import { prisma } from "@/prisma-client";
import { BadgeApiType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

// Zod를 사용한 입력 데이터 검증
const badgeLogSchema = z.object({
  apiType: z.string(),
  status: z.number(),
  message: z.string(),
  userId: z.string().optional(),
  accountUserId: z.string().optional(),
  activityId: z.string(),
  campaignId: z.string(),
  domainId: z.string(),
  accessToken: z.string().optional(),
  rawLog: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 입력 데이터 검증
    const validatedData = badgeLogSchema.parse(body);

    // DB에 저장
    const badgeLog = await prisma.badgeLog.create({
      data: {
        apiType: validatedData.apiType as BadgeApiType,
        status: validatedData.status,
        message: validatedData.message,
        userId: validatedData.userId,
        campaignId: validatedData.campaignId,
        domainId: validatedData.domainId,
        accountUserId: validatedData.accountUserId ?? "",
        activityId: validatedData.activityId,
        accessToken: validatedData.accessToken ?? "",
        rawLog: validatedData.rawLog ?? "",
      },
    });

    return NextResponse.json(
      { success: true, data: badgeLog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating BadgeLog:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
