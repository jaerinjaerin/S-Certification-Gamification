import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isValidCampaignQuizSetId } from "./utils/validationUtils";

export async function middleware(request: NextRequest) {
  const session = await auth();

  const { pathname, search } = request.nextUrl;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  if (
    pathname.includes("/error") ||
    pathname.includes("/logout") ||
    pathname.includes("/test") ||
    pathname.includes("/home") ||
    pathname.includes("/site")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  /**
   * 정의되지 않는 path로 접근하는 경우
   */
  if (segments.length < 1) {
    return NextResponse.redirect(new URL("/error/not-found", request.url));
  }

  const campaignName = segments[0];
  const campaignQuizSetPath: string | null = isValidCampaignQuizSetId(
    segments[1]
  )
    ? segments[1]
    : null;

  /**
   * 로그인되지 않은 사용자가 /login 페이지가 아닌 다른 페이지에 접근하려는 경우
   */
  if (!session && !pathname.includes("/login")) {
    const url = campaignQuizSetPath
      ? `${basePath}/${campaignName}/${campaignQuizSetPath}/login${search}`
      : `${basePath}/${campaignName}/login${search}`;

    return NextResponse.redirect(new URL(url, request.url));
  }

  /**
   * 로그인한 사용자가 /login 페이지에 접근하려는 경우
   */
  if (session && pathname.includes("/login")) {
    const url = campaignQuizSetPath
      ? `${basePath}/${campaignName}/${campaignQuizSetPath}/map${search}`
      : `${basePath}/${campaignName}${search}`;

    return NextResponse.redirect(new URL(url, request.url));
  }

  if (session && campaignQuizSetPath && segments.length === 2) {
    const url = `${basePath}/${campaignName}/${campaignQuizSetPath}/map${search}`;

    return NextResponse.redirect(new URL(url, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|monitoring|error|_next/static|_next/image|favicon.ico|.*.png$|.*.php$).*)",
  ],
};
