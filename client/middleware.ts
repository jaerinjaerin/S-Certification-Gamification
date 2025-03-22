import { auth } from "@/auth";
import { AuthType } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let session = await auth();
  if (session?.user.isTokenExpired) {
    session = null;
  }

  // console.log("🚀 ~ middleware ~ session:", session);
  const { pathname, search } = request.nextUrl;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  console.error(
    "move page",
    pathname,
    session?.user.id,
    session?.user.isTokenExpired
  );

  if (
    pathname.includes("/error") ||
    pathname.includes("/logout") ||
    // pathname.includes("/test") ||
    pathname.includes("/home") ||
    pathname.includes("/register") ||
    pathname.includes("/site") ||
    pathname.includes("/not-ready") ||
    pathname.includes("/invalid-access")
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
  const campaignQuizSetPath = segments[1];

  if (campaignName.includes("login")) {
    return NextResponse.redirect(new URL("/error/not-found", request.url));
  }

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
    const authType = session.user?.authType;
    if (authType === AuthType.SUMTOTAL) {
      const url = `${basePath}/${campaignName}`; // 해당 페지지로 이동하면 userlog를 확인하여 맞는 quizset으로 이동하거나 에러 페이지로 이동시킴
      return NextResponse.redirect(new URL(url, request.url));
    } else {
      const url = `${basePath}/${campaignName}/register`; // 해당 페지지로 이동하면 userlog를 확인하여 맞는 quizset으로 이동하거나 에러 페이지로 이동시킴
      return NextResponse.redirect(new URL(url, request.url));
    }
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
