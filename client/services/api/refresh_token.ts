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
      // const data = await response.json();
      console.error("Refreshed tokens:", response);
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();

    console.log("Refreshed tokens:", data);

    // 업데이트된 토큰을 DB에 저장
    await prisma.account.update({
      where: { id: accountId },
      data: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
      },
    });

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error("Unable to refresh token");
  }
}
