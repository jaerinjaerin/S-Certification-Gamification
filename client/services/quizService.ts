import { ApiResponse, QuizLogResponse, QuizSetEx } from "@/types/apiTypes";
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
    return await apiClient.get<ApiResponse<QuizLogResponse>>(url);
  } catch (error) {
    console.error(`Failed to fetch quiz log: ${error}`);
    throw new Error("퀴즈 로그를 가져오는 중 문제가 발생했습니다.");
  }
};
