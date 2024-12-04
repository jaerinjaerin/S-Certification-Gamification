export const dynamic = "force-dynamic";
import { refreshToken } from "@/app/lib/api/refresh_token";
import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // const session = await auth();

    // if (!session) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }
    const searchParams = new URL(request.url).searchParams;
    const orgIdsStr = searchParams.get("org_ids");
    const userId = searchParams.get("user_id");

    if (!userId || !orgIdsStr) {
      return NextResponse.json(
        { message: "userId or orgIds not found" },
        { status: 404 }
      );
    }

    const account = await prisma.account.findFirst({
      where: { userId: userId },
    });

    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    const orgIds = orgIdsStr.split(",");
    let accessToken = account.access_token;
    let isTokenRefreshed = false; // 토큰 갱신 여부 플래그
    const results: any[] = [];

    for (const orgId of orgIds) {
      let success = false;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await fetch(
            `https://samsung.sumtotal.host/apis/api/v1/organizations/search?organizationId=${orgId}`,
            {
              cache: "no-store",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!response.ok) {
            if (response.status === 401 && attempt === 0 && !isTokenRefreshed) {
              // 토큰이 만료되었을 경우 한 번만 갱신
              accessToken = await refreshToken(
                account.id,
                account.refresh_token || ""
              );
              isTokenRefreshed = true; // 토큰이 갱신되었음을 표시
              continue; // 갱신된 토큰으로 요청을 다시 시도
            }
            throw new Error(`Failed to fetch data: ${response.statusText}`);
          }

          const data = await response.json();
          results.push(data);
          success = true;
          break;
        } catch (error) {
          console.error(`Error fetching data for orgId ${orgId}:`, error);
        }
      }

      if (!success) {
        console.error(`Failed to fetch data for orgId ${orgId} after retries.`);
      }
    }

    let job: string | null = null;
    let store: string | null = null;

    results.forEach((result: any) => {
      const text9 = result.data[0]?.optionalInfo.text9;
      const integer1 = result.data[0]?.optionalInfo.integer1;

      if (!text9 || !integer1) return;

      if (integer1 === "7" || integer1 === 7) {
        job = text9;
      }

      if (integer1 === "5" || integer1 === 5) {
        store = text9;
      }
    });

    return NextResponse.json({ job, store }, { status: 200 });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
