// import auth from 'next-auth/jwt';
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // const session = await auth();
  // console.log("middleware session:", session);

  // const { pathname, search } = request.nextUrl;

  // if (
  //   pathname.includes("/error") ||
  //   pathname.includes("/logout") ||
  //   pathname.includes("/home")
  // ) {
  //   return NextResponse.next();
  // }

  // const segments = pathname.split("/").filter(Boolean); // 빈 문자열 제거
  // if (segments.length < 1) {
  //   return NextResponse.redirect(new URL("/error/not-found", request.url));
  // }

  // // const dashboardPath = segments[0];
  // const campaignName = segments[0];

  // let campaignQuizSetId: string | null = null;
  // if (isValidCampaignQuizSetId(segments[2])) {
  //   campaignQuizSetId = segments[2] as string;
  // }

  // // 로그인되지 않은 사용자가 /login 페이지가 아닌 다른 페이지에 접근하려는 경우
  // if (
  //   !session &&
  //   !pathname.includes("/login")
  //   // pathname !== "/login/member" &&
  //   // pathname !== "/login/guest" &&
  //   // pathname !== "/verify-request"
  // ) {
  //   const url = campaignQuizSetId
  //     ? `/${campaignName}/${campaignQuizSetId}/login${search}`
  //     : `/${campaignName}/login${search}`;

  //   return NextResponse.redirect(new URL(url, request.url));
  // }

  // if (session && pathname.includes("/login")) {
  //   const url = campaignQuizSetId
  //     ? `/${campaignName}/${campaignQuizSetId}/intro${search}`
  //     : `/${campaignName}${search}`;

  //   console.log("url:", url);

  //   return NextResponse.redirect(new URL(url, request.url));
  // }

  // if (session && campaignQuizSetId && segments.length === 3) {
  //   const url = `/${campaignName}/${campaignQuizSetId}/intro${search}`;

  //   console.log("url:", url);

  //   return NextResponse.redirect(new URL(url, request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*.png$).*)"],
};
