"use server";

import { prisma } from "@/prisma-client";
import { ApiResponseV2 } from "@/types/apiTypes";
import { Campaign } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

export async function getCampaignByName(
  campaignName: string
): Promise<ApiResponseV2<Campaign>> {
  if (!campaignName) {
    Sentry.captureMessage("Missing required parameter: campaign_name");
    return {
      success: false,
      status: 400,
      error: {
        message: "Missing required parameter: campaign_name",
        code: "MISSING_PARAMETER",
      },
    };
  }

  try {
    if (campaignName.toLowerCase() !== "s25") {
      const campaign = await prisma.campaign.findFirst({
        where: {
          slug: {
            equals: campaignName,
            mode: "insensitive", // 대소문자 구분 없이 검색
          },
        },
      });

      if (campaign == null) {
        Sentry.captureMessage(`Campaign not found: ${campaignName}`);
        return {
          success: false,
          status: 404,
          error: {
            message: "An unexpected error occurred",
            code: "UNEXPECTED_ERROR",
          },
        };
      }

      return {
        result: {
          item: campaign,
        },
        success: true,
        status: 200,
      };
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        name: {
          equals: campaignName,
          mode: "insensitive", // 대소문자 구분 없이 검색
        },
      },
    });

    if (!campaign) {
      Sentry.captureMessage(`Campaign not found: ${campaignName}`);
      return {
        success: false,
        status: 404,
        error: {
          message: "getCampaignByName Campaign not found",
          code: "CAMPAIGN_NOT_FOUND",
        },
      };
    }

    return {
      result: {
        item: campaign,
      },
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("❌ Error fetching campaign:", error);
    Sentry.captureException(error);

    return {
      success: false,
      status: 500,
      error: {
        message: "An unexpected error occurred",
        code: "UNEXPECTED_ERROR",
      },
    };
  }
}
