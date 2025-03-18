"use server";

import {
  defaultLanguageCode,
  sumtotalUserOthersJobId,
} from "@/core/config/default";
import { ApiError } from "@/core/error/api_error";
import { prisma } from "@/prisma-client";
import { ApiResponseV2, QuizSetEx } from "@/types/apiTypes";
import { newLanguages } from "@/utils/language";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { BadgeType, Language, Question } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
export async function getQuizSet(
  quizsetPath: string,
  userId: string,
  campaignSlug: string
): Promise<ApiResponseV2<QuizSetEx>> {
  try {
    if (!quizsetPath || !userId || !campaignSlug) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Quiz set path and User ID are required"
      );
    }

    const codes = extractCodesFromPath(quizsetPath);
    if (codes == null) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid quizset path");
    }
    const { domainCode, languageCode } = codes;

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      console.error("getQuizSet User not found:", userId);
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }

    const userJobId = user.jobId ?? sumtotalUserOthersJobId;
    const job = await prisma.job.findFirst({
      where: { id: userJobId },
    });

    const jobCode = job?.code ?? "fsm";

    const domain = await prisma.domain.findFirst({
      where: { code: domainCode },
    });

    if (!domain) {
      console.error("getQuizSet Domain not found:", domainCode);
      throw new ApiError(404, "NOT_FOUND", "Domain not found");
    }

    if (campaignSlug.toLowerCase() !== "s25") {
      const campaign = await prisma.campaign.findFirst({
        where: {
          slug: {
            equals: campaignSlug,
            mode: "insensitive", // 대소문자 구분 없이 검색
          },
        },
        include: {
          settings: true,
        },
      });

      if (!campaign) {
        console.error("getQuizSet Campaign not found:", campaign);
        throw new ApiError(404, "NOT_FOUND", "getQuizSet Campaign not found");
      }

      const language = await prisma.language.findFirst({
        where: { code: languageCode },
      });

      if (!language) {
        console.error("getQuizSet Language not found:", language);
        throw new ApiError(404, "NOT_FOUND", "Language not found");
      }

      console.log("getQuizSet:", {
        campaignId: campaign.id,
        domainId: domain.id,
        languageId: language.id,
        jobCodes: { has: jobCode },
      });

      const quizSet = await prisma.quizSet.findFirst({
        where: {
          campaignId: campaign.id,
          domainId: domain.id,
          languageId: language.id,
          jobCodes: { has: jobCode },
        },
        include: {
          domain: {
            include: {
              subsidiary: {
                include: {
                  region: true,
                },
              },
            },
          },
          language: true,
          quizStages: {
            include: {
              badgeImage: true,
              questions: {
                orderBy: {
                  order: "asc",
                },
                where: {
                  enabled: true,
                },
                include: {
                  options: {
                    orderBy: {
                      order: "asc",
                    },
                  },
                  backgroundImage: true,
                  characterImage: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      if (!quizSet) {
        console.error(
          "getQuizSet Quiz set not found:",
          "userId",
          userId,
          "quizsetPath",
          quizsetPath,
          "campaignSlug",
          campaignSlug,
          "campaignId",
          campaign.id,
          "domainId",
          domain.id,
          "languageId",
          language.id
        );
        throw new ApiError(404, "NOT_FOUND", "Quiz set not found");
      }

      const activityBadges = await prisma.activityBadge.findMany({
        where: {
          campaignId: campaign.id,
          jobCode: jobCode,
          domainId: domain.id,
          languageId: language.id,
        },
        include: {
          badgeImage: true,
        },
      });

      const firstBadgeIndex =
        jobCode === "ff"
          ? campaign.settings?.ffFirstBadgeStageIndex
          : campaign.settings?.fsmFirstBadgeStageIndex;

      if (firstBadgeIndex) {
        const firstBadge = activityBadges.find(
          (badge) => badge.badgeType === BadgeType.FIRST
        );
        if (firstBadge) {
          if (quizSet.quizStages.length > firstBadgeIndex) {
            quizSet.quizStages[firstBadgeIndex].isBadgeStage = true;
            quizSet.quizStages[firstBadgeIndex].badgeImageId =
              firstBadge.badgeImageId;
            quizSet.quizStages[firstBadgeIndex].badgeImage =
              firstBadge.badgeImage;
            quizSet.quizStages[firstBadgeIndex].badgeActivityId =
              firstBadge.activityId;
            quizSet.quizStages[firstBadgeIndex].badgeType =
              firstBadge.badgeType;
          }
        }
      }

      const secondBadgeIndex =
        jobCode === "ff"
          ? campaign.settings?.ffSecondBadgeStageIndex
          : campaign.settings?.fsmSecondBadgeStageIndex;

      if (secondBadgeIndex) {
        const secondBadge = activityBadges.find(
          (badge) => badge.badgeType === BadgeType.SECOND
        );
        if (secondBadge) {
          if (quizSet.quizStages.length > secondBadgeIndex) {
            quizSet.quizStages[secondBadgeIndex].isBadgeStage = true;
            quizSet.quizStages[secondBadgeIndex].badgeImageId =
              secondBadge.badgeImageId;
            quizSet.quizStages[secondBadgeIndex].badgeImage =
              secondBadge.badgeImage;
            quizSet.quizStages[secondBadgeIndex].badgeActivityId =
              secondBadge.activityId;
            quizSet.quizStages[secondBadgeIndex].badgeType =
              secondBadge.badgeType;
          }
        }
      }
      // console.log("activityBadges:", activityBadges);
      // console.log("campaign:", campaign.settings);
      // console.log("quizSet:", quizSet);

      // const campaignSettings = await prisma.campaignSettings.findFirst({
      //   where: {
      //     campaignId: campaign.id,
      //   },
      // });

      // console.log("campaignSettings:", campaignSettings);

      // if (campaignSettings) {
      //   const maxStage = campaignSettings.totalStages;
      //   console.log("maxStage:", maxStage, quizSet.quizStages.length);
      //   if (maxStage) {
      //     if (quizSet.quizStages.length > maxStage + 1) {
      //       quizSet.quizStages = quizSet.quizStages.slice(0, maxStage + 1);
      //     }
      //   }
      // }

      return {
        success: true,
        status: 200,
        result: {
          item: quizSet as QuizSetEx,
        },
      };
    }

    // DEPRECATED: 구버전 (S25) 캠페인 로직입니다.
    // 대체 로직은 위의 로직을 사용
    const quizSet = await prisma.quizSet.findFirst({
      where: {
        domainId: domain?.id,
        jobCodes: { has: jobCode },
      },
      include: {
        quizStages: {
          include: {
            badgeImage: true, // Include badgeImage relation in quizStages
          },
          orderBy: {
            order: "asc", // 'asc' for ascending order, use 'desc' for descending
          },
        },
      },
    });

    if (!quizSet) {
      throw new ApiError(404, "NOT_FOUND", "Quiz set not found");
    }

    // console.log("quizSet:", quizSet);
    let language: Language | null = null;

    const newLanguageCodes = newLanguages.map((lang) => lang.code);
    if (newLanguageCodes.includes(languageCode)) {
      language = await prisma.language.findFirst({
        where: { code: defaultLanguageCode },
      });
    } else {
      language = await prisma.language.findFirst({
        where: { code: languageCode },
      });
    }

    // console.log("language:", language);

    if (!language) {
      language = await prisma.language.findFirst({
        where: { code: defaultLanguageCode },
      });
    }

    const defaultLanguage = await prisma.language.findFirst({
      where: { code: defaultLanguageCode },
    });

    // // console.log("language:", language, defaultLanguage);

    const languageId = language?.id;

    // console.log("languageId:", languageId);

    const quizStagesWithQuestions = await Promise.all(
      quizSet.quizStages.map(async (quizStage) => {
        // console.log("quizStage:", quizStage.questionIds, languageId);
        const questions = await prisma.question.findMany({
          where: {
            originalQuestionId: { in: quizStage.questionIds },
            // languageId: { in: [languageId!, defaultLanguage!.id] },
            languageId: languageId,
          },
          include: {
            options: true,
            backgroundImage: true,
            characterImage: true,
          },
        });

        // TODO: questionIds 순서로 정렬해야 함.
        questions.sort((a: Question, b: Question) => {
          return a.order - b.order;
        });

        // console.log("questions:", questions);

        // languageId 우선, 없으면 defaultLanguage.id
        const prioritizedQuestions = questions.filter(
          (q) => q.languageId === languageId
        );
        const fallbackQuestions = questions.filter(
          (q) => q.languageId === defaultLanguage!.id
        );

        return {
          ...quizStage,
          questions:
            prioritizedQuestions.length > 0
              ? prioritizedQuestions
              : fallbackQuestions,
        };
      })
    );

    // console.log("quizStagesWithQuestions:", quizStagesWithQuestions);

    return {
      success: true,
      status: 200,
      result: {
        item: {
          ...quizSet,
          quizStages: quizStagesWithQuestions,
          language,
          domain,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching question data:", error);

    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/campaigns/quizsets/[quizset_path]",
        method: "POST",
        description: "Failed to fetch question data",
      });
      scope.setTag("user_id", userId);
      scope.setTag("quizset_path", quizsetPath);
      return scope;
    });

    // ApiError 처리
    if (error instanceof ApiError) {
      return {
        success: false,
        status: error.statusCode,
        error: { code: error.code, message: error.message },
      };
    }

    // 예상치 못한 에러 처리
    return {
      success: false,
      status: 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}
