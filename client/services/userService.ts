import { ApiResponse } from "@/types/apiTypes";
import { User } from "@prisma/client";
import { apiClient } from "./apiClient";

/**
 * Fetch user information by user ID.
 * @param userId The ID of the user.
 * @returns ApiResponse with User details.
 */
export const fetchUserInfo = async (
  userId: string
): Promise<ApiResponse<User>> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`;
    return await apiClient.get<ApiResponse<User>>(url);
  } catch (error) {
    console.error(`Failed to fetch user info: ${error}`);
    throw new Error("Failed to fetch user info.");
  }
};
