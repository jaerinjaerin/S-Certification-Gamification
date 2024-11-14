// import auth from 'next-auth/jwt';
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  console.log("middleware session:", session);
  // const token = await getToken({
  //   req: request,
  //   secret: process.env.NEXTAUTH_SECRET,
  // });

  const { pathname, search } = request.nextUrl;

  const url = new URL(request.url);
  const activityId = url.searchParams.get("activityId");
  const userJob = url.searchParams.get("job");
  const currentDomain = request.nextUrl.hostname; // 현재 도메인 정보 가져오기

  const response = NextResponse.next();

  const dddd = response.cookies.get("userJob");
  console.log("dddd:", dddd);

  // 쿠키로 저장하여 클라이언트에 전달
  if (activityId) {
    response.cookies.set("activityId", activityId, {
      path: "/",
      domain: currentDomain, // 현재 도메인 설정
      httpOnly: false, // 클라이언트에서 읽을 수 있도록 설정
      sameSite: "lax",
    });
    console.log("activityId:", activityId);
  }
  if (userJob) {
    response.cookies.set("userJob", userJob, {
      path: "/",
      domain: currentDomain, // 현재 도메인 설정
      httpOnly: false, // 클라이언트에서 읽을 수 있도록 설정
      sameSite: "lax",
    });
    console.log("userJob:", userJob);
  }

  // 로그인되지 않은 사용자가 /login 페이지가 아닌 다른 페이지에 접근하려는 경우
  if (!session && pathname !== "/login" && pathname !== "/verify-request") {
    return NextResponse.redirect(new URL(`/login${search}`, request.url));
  }

  // 로그인된 사용자가 /login 페이지에 접근하려는 경우
  if (
    session &&
    (pathname === "/login" ||
      pathname === "/verify-request" ||
      pathname === "/")
  ) {
    return NextResponse.redirect(new URL(`/intro${search}`, request.url));
  }

  // return NextResponse.next()
  return response;
}

export const config = {
  matcher: ["/", "/login", "/home", "/verify-request", "/test"], // 미들웨어를 적용할 경로를 지정
};
