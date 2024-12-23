// import auth from 'next-auth/jwt';
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isValidCampaignQuizSetId } from "./utils/validationUtils";

export async function middleware(request: NextRequest) {
  const session = await auth();
  // console.log("middleware session:", session);

  const { pathname, search } = request.nextUrl;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  console.log("middleware: basePath:", basePath);

  if (
    pathname.includes("/error") ||
    pathname.includes("/logout") ||
    pathname.includes("/home")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean); // 빈 문자열 제거
  if (segments.length < 1) {
    return NextResponse.redirect(new URL("/error/not-found", request.url));
  }

  // const certificationPath = segments[0];
  const campaignName = segments[0];

  let campaignQuizSetPath: string | null = null;
  if (isValidCampaignQuizSetId(segments[1])) {
    campaignQuizSetPath = segments[1] as string;
  }

  console.log("campaignQuizSetPath:", campaignName, campaignQuizSetPath);

  // 로그인되지 않은 사용자가 /login 페이지가 아닌 다른 페이지에 접근하려는 경우
  if (
    !session &&
    !pathname.includes("/login")
    // pathname !== "/login/member" &&
    // pathname !== "/login/guest" &&
    // pathname !== "/verify-request"
  ) {
    const url = campaignQuizSetPath
      ? `${basePath}/${campaignName}/${campaignQuizSetPath}/login${search}`
      : `${basePath}/${campaignName}/login${search}`;

    return NextResponse.redirect(new URL(url, request.url));
  }

  if (session && pathname.includes("/login")) {
    const url = campaignQuizSetPath
      ? `${basePath}/${campaignName}/${campaignQuizSetPath}/map${search}`
      : `${basePath}/${campaignName}${search}`;

    console.log("middleware: url:", url);

    return NextResponse.redirect(new URL(url, request.url));
  }

  if (session && campaignQuizSetPath && segments.length === 2) {
    const url = `${basePath}/${campaignName}/${campaignQuizSetPath}/map${search}`;

    console.log("middleware: url:", url);

    return NextResponse.redirect(new URL(url, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*.png$).*)"],
};
