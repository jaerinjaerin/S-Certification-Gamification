import {
  ApiListResponse,
  ApiResponse,
  QuizLogResponse,
  QuizSetEx,
} from "@/types/apiTypes";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { Domain, Language } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { apiClient } from "./apiClient";

/**
 * Fetch quiz set details by path and user ID.
 * @param quizsetPath The path of the quiz set.
 * @param userId The ID of the user.
 * @returns ApiResponse with QuizSetEx details.
 */
export const fetchQuizSet = async (
  quizsetPath: string,
  userId: string
): Promise<ApiResponse<QuizSetEx>> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/quizsets/${quizsetPath}?user_id=${userId}`;
    return await apiClient.get<ApiResponse<QuizSetEx>>(url);
  } catch (error) {
    console.error(`Failed to fetch quiz set: ${error}`);
    throw new Error("퀴즈 세트를 가져오는 중 문제가 발생했습니다.");
  }
};

/**
 * Fetch quiz logs by user ID and campaign name.
 * @param userId The ID of the user.
 * @param campaignName The name of the campaign.
 * @returns ApiResponse with QuizLogResponse details.
 */
export const fetchQuizLog = async (
  userId: string,
  campaignName: string
): Promise<ApiResponse<QuizLogResponse>> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/sets?user_id=${userId}&campaign_name=${campaignName}`;
    const result = await apiClient.get<ApiResponse<QuizLogResponse>>(url);
    // console.log("Quiz log result:", result.item?.quizQuestionLogs);
    return result;
  } catch (error) {
    console.error(`Failed to fetch quiz log: ${error}`);
    throw new Error("퀴즈 로그를 가져오는 중 문제가 발생했습니다.");
  }
};

export interface ValidationResult {
  validatedPath: string; // 수정된 또는 원래의 `quizSetPath`
  isValid: boolean; // 검증이 성공했는지 여부
  wasCorrected: boolean; // 수정이 이루어졌는지 여부
}

export const validateAndCorrectQuizSetPath = async (
  quizSetPath: string,
  defaultLanguageCode: string
): Promise<ValidationResult> => {
  let wasCorrected = false;

  try {
    const { domainCode, languageCode } = extractCodesFromPath(quizSetPath);

    // 도메인 검증
    const domainsResponse = await apiClient.get<ApiListResponse<Domain>>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/domains`,
      "force-cache"
    );

    const isDomainValid = domainsResponse.items?.some(
      (domain: Domain) => domain.code === domainCode
    );

    if (!isDomainValid) {
      console.error(`Invalid domain code: ${domainCode}`);
      return {
        validatedPath: quizSetPath,
        isValid: false,
        wasCorrected: false,
      };
    }

    // 언어 검증
    const languagesResponse = await apiClient.get<ApiListResponse<Language>>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/languages`,
      "force-cache"
    );

    const isLanguageValid = languagesResponse.items?.some(
      (language: Language) => language.code === languageCode
    );

    if (!isLanguageValid) {
      // languageCode를 기본값으로 수정
      console.warn(
        `Invalid language code: ${languageCode}. Defaulting to ${defaultLanguageCode}`
      );
      const updatedPath = quizSetPath.replace(
        `${languageCode}`,
        `${defaultLanguageCode}`
      );
      wasCorrected = true;

      return {
        validatedPath: updatedPath,
        isValid: true,
        wasCorrected: true,
      };
    }

    // 모든 검증 통과
    return {
      validatedPath: quizSetPath,
      isValid: true,
      wasCorrected: false,
    };
  } catch (error) {
    console.error(`Failed to validate quizSetPath: ${error}`);
    Sentry.captureMessage("Quiz path validation error", (scope) => {
      scope.setContext("operation", {
        type: "validation",
        description: "Validation error",
      });
      scope.setTag("quizSetPath", quizSetPath);
      return scope;
    });

    return {
      validatedPath: quizSetPath,
      isValid: false,
      wasCorrected: false,
    };
  }
};
