export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // const { searchParams } = new URL(request.url);
  // const code = searchParams.get('code'); // 인증 코드 추출

  // 1. 인증 코드가 없는 경우 SumTotal 로그인 페이지로 리디렉션하여 인증 코드 요청
  // if (!code) {
  //   const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}&response_type=code`;
  //   return redirect(authUrl);
  // }

  // 2. 인증 코드가 있는 경우 액세스 토큰 요청
  try {
    // const tokenResponse = await fetch(TOKEN_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     grant_type: 'authorization_code',
    //     client_id: CLIENT_ID || '',
    //     client_secret: CLIENT_SECRET || '',
    //     code: code,
    //     redirect_uri: CALLBACK_URL || '',
    //   }),
    // });

    // if (!tokenResponse.ok) {
    //   const errorData = await tokenResponse.json();
    //   return NextResponse.json(
    //     { message: errorData.error || 'Failed to obtain access token' },
    //     { status: tokenResponse.status }
    //   );
    // }

    // const tokenData = await tokenResponse.json();
    // const accessToken = tokenData.access_token;

    // // 3. SumTotal API 호출
    // const apiResponse = await fetch(
    //   `https://samsung.sumtotal.host/api/v1/users/${userId}/activities`,
    //   {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${accessToken}`, // 액세스 토큰 사용
    //     },
    //   }
    // );

    // if (!apiResponse.ok) {
    //   const errorData = await apiResponse.json();
    //   return NextResponse.json(
    //     { message: errorData.message || 'Failed to fetch activities' },
    //     { status: apiResponse.status }
    //   );
    // }

    // const data = await apiResponse.json();
    // return NextResponse.json(data, { status: 200 });

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

    const searchParams = new URL(request.url).searchParams;

    // Retrieve specific query parameters
    const orgId = searchParams.get("id"); // e.g., 'value1'

    // try {
    const response = await fetch(
      // `https://samsung.sumtotal.host/apis/api/v1/jobs`,
      // `https://samsung.sumtotal.host/apis/api/v2/advanced/person/${account.personId}`,
      // `https://samsung.sumtotal.host/apis/api/v1/users/${account.providerAccountId}`,
      `https://samsung.sumtotal.host/apis/api/v1/organizations/search?organizationId=${orgId}`,
      // `https://samsung.sumtotal.host/apis/api/v1/users/summary`,
      // `https://samsung.sumtotal.host/apis/api/v1/advanced/users/${account.providerAccountId}`,
      // `https://samsung.sumtotal.host/apis/api/v1/users/${account.providerAccountId}/organizations`,
      // `https://samsung.sumtotal.host/apis/api/v2/users/organizations?userId=${account.providerAccountId}`,
      // `https://samsung.sumtotal.host/apis//api/v2/advanced/userprofile`,
      // 'https://samsung.sumtotal.host/apis/api/v1/users/2135156/activities',
      {
        // method: 'GET',
        // mode: 'no-cors',
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.access_token}`, // 액세스 토큰 사용
          // Authorization:
          //   'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkEwQjVCMUFCMTUzMjI1MzRDNUIxQUU3QTdEMjZDRkI3NDYzNTIwMzNSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6Im9MV3hxeFV5SlRURnNhNTZmU2JQdDBZMUlETSJ9.eyJuYmYiOjE3MzEzMDMyMzMsImV4cCI6MTczMTMxMDQzMywiaXNzIjoiaHR0cHM6Ly9zYW1zdW5nLnN1bXRvdGFsLmhvc3QvYXBpc2VjdXJpdHkiLCJhdWQiOlsiZXh0YXBpcyIsImh0dHBzOi8vc2Ftc3VuZy5zdW10b3RhbC5ob3N0L2FwaXNlY3VyaXR5L3Jlc291cmNlcyJdLCJjbGllbnRfaWQiOiJTQU1TVU5HRUxFQ1RST05JQ1NfUFJPRF9hOGUxNGVkZTI5Mjk0OWM5OGNiZmU3NzllZGIyZGFhYyIsInN1YiI6ImhxX2FwaS50ZXN0MSIsImF1dGhfdGltZSI6MTczMTMwMjk0NCwiaWRwIjoibG9jYWwiLCJuYW1lIjoiaHFfYXBpLnRlc3QxIiwidXNlcm5hbWUiOiJocV9hcGkudGVzdDEiLCJtYXNrZWR1c2VyaWQiOiIyM0UzOEI2NEU0NjgwRTBBQkZBM0JDQjBGNjg3NURCNiIsInJvbGUiOiJQb3J0YWwgVXNlciIsInRlbmFudCI6IlNBTVNVTkdFTEVDVFJPTklDU19QUk9EIiwiYnJva2Vyc2Vzc2lvbiI6ImQ5MzU3N2RkZjY5NTQ2NzBiYjc0OTg4NWQ1NWExMThhIiwiY3VsdHVyZSI6ImVuLVVTIiwibGFuZ3VhZ2UiOiJlbi11cyIsImRhdGVmb3JtYXQiOiJNTS9kZC95eXl5IiwidGltZWZvcm1hdCI6ImhoOm1tIGEiLCJ1c2VyaWQiOiIyMTM1MTU2IiwicGVyc29ucGsiOiIxNDg0MjAzIiwiZ3Vlc3RhY2NvdW50IjoiMCIsInVzZXJ0aW1lem9uZWlkIjoiQXNpYS9TZW91bCIsInR3b0xldHRlcklTT0xhbmd1YWdlTmFtZSI6ImVuIiwiaXNydGwiOiJGYWxzZSIsInBlcnNvbmd1aWQiOiI0ZjM3YjM0Mi0wZjYyLTQxMzItOTM1MS0wMGYzN2NhNTMzM2EiLCJ1c2VyaWRoYXNoIjoiMTg5Nzk0NDQyMyIsIndmbXVzZXIiOiJUcnVlIiwicHJvcGVybmFtZSI6IlRlc3QrVGVzdCIsImp0aSI6IjVCMzkzMTUwRTI2REFBMTU4RTNGMjhCMjM2QUI2QTc0IiwiaWF0IjoxNzMxMzAzMjMzLCJzY29wZSI6WyJhbGxhcGlzIl0sImFtciI6WyJwd2QiXX0.xZw6ogWCaTNtX0Zo4bbkT-_e-6-wC0KrNWZd5oNWiPrQIpFJlPZy-gjlh2yc2ukq6jFiXxlS58LaEs6OqIcjKomYRjIiuLJxxAdmjpB4ZmEFqjNyufVvGamNilV7aCCaX_Ru76uTSqDxP0sleo85qtY0LzknBKzr4EcNNGoLhSn1TgXUGKtcMphpwPg_Yomkdnp3rXDxI62n_-EYInUNnrtAFBgCG3tKkQnv9-lAv3olnxUHKL1L9MUKsroKsTyNIbM82QhU1LCCo7YktK97cQ5sNiMYNtWQ9iSEIxtUX33sz7ff2copMhGNk77gCcLsMxO9Jtk2T_iC7xMaUP09gA', // 액세스 토큰 사용
        },
      }
    );

    console.log("response", response);

    if (!response.ok) {
      // const errorData = await response.json();
      return NextResponse.json(
        { message: response.statusText || "Failed to fetch activities" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("data", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching user orgn:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
