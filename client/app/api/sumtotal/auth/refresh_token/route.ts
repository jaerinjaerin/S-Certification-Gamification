export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

const TOKEN_URL = "https://samsung.sumtotal.host/apisecurity/connect/token";

const CLIENT_ID = process.env.SUMTOTAL_CLIENT_ID;
const CLIENT_SECRET = process.env.SUMTOTAL_CLIENT_SECRET;

export async function GET() {
  // const { searchParams } = new URL(request.url);
  // const code = searchParams.get('code'); // 인증 코드 추출

  // 1. 인증 코드가 없는 경우 SumTotal 로그인 페이지로 리디렉션하여 인증 코드 요청
  // if (!code) {
  //   const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}&response_type=code`;
  //   return redirect(authUrl);
  // }

  // 2. 인증 코드가 있는 경우 액세스 토큰 요청
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("session", session);

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    console.log("account", account);

    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refresh_token || "",
        client_id: CLIENT_ID!, // 환경 변수에 저장된 Client ID
        client_secret: CLIENT_SECRET!, // 환경 변수에 저장된 Client Secret
      }),
    });

    // 3. 응답 확인
    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      return NextResponse.json(
        { error: error.error_description },
        { status: tokenResponse.status }
      );
    }

    const tokens = await tokenResponse.json();

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token: tokens.access_token,
        expires_at: tokens.expires_at,
        refresh_token: tokens.refresh_token,
      },
    });

    return NextResponse.json(tokens, { status: 200 });
  } catch (error) {
    console.error("Error refresh token:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
