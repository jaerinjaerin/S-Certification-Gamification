// import auth from 'next-auth/jwt';
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isValidCampaignQuizSetId } from "./utils/validationUtils";

export async function middleware(request: NextRequest) {
  const session = await auth();
  console.log("middleware session:", session);
  // const token = await getToken({
  //   req: request,
  //   secret: process.env.NEXTAUTH_SECRET,
  // });

  const { pathname, search } = request.nextUrl;

  // console.log("pathname:", pathname, pathname.includes("/error"));

  if (
    pathname.includes("/error") ||
    pathname.includes("/logout") ||
    pathname.includes("/home")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean); // 빈 문자열 제거
  if (segments.length === 0) {
    return NextResponse.redirect(new URL("/error/not-found", request.url));
  }
  const campaignName = segments[0];
  // const campaignQuizSetId = segments.length > 1 ? segments[1] : null;
  let campaignQuizSetId: string | null = null;
  if (segments.length > 1 && isValidCampaignQuizSetId(segments[1])) {
    campaignQuizSetId = segments[1] as string;
  }

  // 로그인되지 않은 사용자가 /login 페이지가 아닌 다른 페이지에 접근하려는 경우
  if (
    !session &&
    !pathname.includes("/login")
    // pathname !== "/login/member" &&
    // pathname !== "/login/guest" &&
    // pathname !== "/verify-request"
  ) {
    const url = campaignQuizSetId
      ? `/${campaignName}/${campaignQuizSetId}/login${search}`
      : `/${campaignName}/login${search}`;

    return NextResponse.redirect(new URL(url, request.url));
  }

  if (session && pathname.includes("/login")) {
    const url = campaignQuizSetId
      ? `/${campaignName}/${campaignQuizSetId}/intro${search}`
      : `/${campaignName}${search}`;

    console.log("url:", url);

    return NextResponse.redirect(new URL(url, request.url));
  }

  if (session && campaignQuizSetId && segments.length === 2) {
    const url = `/${campaignName}/${campaignQuizSetId}/intro${search}`;

    console.log("url:", url);

    return NextResponse.redirect(new URL(url, request.url));
  }

  // 로그인된 사용자가 /login 페이지에 접근하려는 경우
  // if (session) {
  //   const segments = pathname.split("/").filter(Boolean); // 빈 문자열 제거
  //   const campaignName = segments[0];
  //   let campaignQuizSetId = null;
  //   if (segments.length > 1 && isValidCampaignQuizSetId(segments[1])) {
  //     campaignQuizSetId = segments[1];
  //   }

  //   if (pathname.includes("/login") || pathname === "/") {
  //     const url = campaignQuizSetId
  //       ? `/${campaignName}/${campaignQuizSetId}/intro${search}`
  //       : `/${campaignName}${search}`;

  //     console.log("url:", url);

  //     return NextResponse.redirect(new URL(url, request.url));
  //   }

  //   // if (!campaignQuizSetId) {
  //   //   return NextResponse.redirect(
  //   //     new URL(`/${campaignName}${search}`, request.url)
  //   //   );
  //   // }
  // }

  return NextResponse.next();
  // return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*.png$).*)"],
};

// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
//     "/",
//     "/test",
//     "/:campaign_name",
//     "/:campaign_name/login",
//     "/:campaign_name/:event_detail_path*",
//   ], // 미들웨어를 적용할 경로를 지정
// };
