"use server";
import { prisma } from "@/prisma-client";

// Refresh token 함수
export async function refreshToken(accountId: string, refreshToken: string) {
  const TOKEN_REFRESH_URL =
    "https://samsung.sumtotal.host/apisecurity/connect/token";

  const CLIENT_ID = process.env.SUMTOTAL_CLIENT_ID;
  const CLIENT_SECRET = process.env.SUMTOTAL_CLIENT_SECRET;

  try {
    const response = await fetch(TOKEN_REFRESH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const tokens = await response.json();

    // console.log("Refreshed tokens:", tokens);

    // 업데이트된 토큰을 DB에 저장
    await prisma.account.update({
      where: { id: accountId },
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at,
      },
    });

    return tokens.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error("Unable to refresh token");
  }
}
