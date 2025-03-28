"use server";

import { prisma } from "@/prisma-client";
import { BadgeApiType } from "@prisma/client";
import { z } from "zod";

// Zod로 입력 검증 스키마 정의
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

// 서버 액션 함수
export async function createBadgeLog(data: unknown) {
  try {
    // Zod 검증
    const validatedData = badgeLogSchema.parse(data);

    // Prisma를 통한 DB 저장
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

    return { success: true, data: badgeLog };
  } catch (error) {
    console.error("Error in createBadgeLog:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }

    return { success: false, error: "Internal Server Error" };
  }
}

export async function extractRawLogFromResponse(
  response: Response
): Promise<string> {
  try {
    const contentType = response.headers.get("Content-Type");
    let rawLog = "";

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Error response:", data);
      rawLog = JSON.stringify(data);
    } else {
      const text = await response.text();
      console.log("Non-JSON error response:", text);
      rawLog = text;
    }

    return rawLog;
  } catch (err) {
    console.error("Failed to extract rawLog:", err);
    return "Failed to parse error response";
  }
}

export async function normalizeError(
  error: unknown
): Promise<{ name: string; message: string }> {
  let errorMessage = "Unknown error";
  let errorName = "Error";

  if (error instanceof Error) {
    errorMessage = error.message;
    errorName = error.name;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (typeof error === "object" && error !== null) {
    errorMessage = (error as any).message || "Unknown object error";
    errorName = (error as any).name || "Error";
  }

  return {
    name: errorName,
    message: errorMessage,
  };
}
