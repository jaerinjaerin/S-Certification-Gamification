"use server";

import { prisma } from "@/prisma-client";
import { ApiResponseV2 } from "@/types/apiTypes";
import { Language } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

export async function getLanguageCodes(): Promise<ApiResponseV2<string[]>> {
  try {
    const languages = await prisma.language.findMany();

    return {
      result: {
        item: languages.map((language: Language) => language.code),
      },
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("❌ Error fetching languages:", error);
    Sentry.captureException(error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return {
      success: false,
      status: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: errorMessage,
      },
    };
  }
}
