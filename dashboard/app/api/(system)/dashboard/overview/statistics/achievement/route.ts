/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { querySearchParams } from "../../../_lib/query";
import { buildWhereWithValidKeys } from "../../../_lib/where";

// UserQuizStatistics, DomainGoal사용
// DomainGoal - ff,fsm,ffses,fsmses의 합이 국가별 총 목표수

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);

    await prisma.$connect();

    const userQuizeBadges = await prisma.userQuizBadgeStageStatistics.findMany({
      where: {
        ...where,
        quizStageIndex: 2,
      },
      select: { regionId: true, domainId: true },
    });

    const domains = await prisma.domain.findMany();

    const domain_goal = await prisma.domainGoal.findMany({
      where: buildWhereWithValidKeys(where, ["campaignId", "createdAt"]),
      orderBy: { updatedAt: "desc" },
    });
    //
    const result = domain_goal
      .map(({ domainId, ff, ffSes, fsm, fsmSes }) => {
        const currentDomain = domains.find((domain) => domain.id === domainId);
        if (!currentDomain) return null;

        const expert = userQuizeBadges.reduce((acc, user) => {
          return acc + (user.domainId === domainId ? 1 : 0);
        }, 0);

        if (expert <= 0) return null;

        const goal = (ff || 0) + (fsm || 0) + (ffSes || 0) + (fsmSes || 0);

        return {
          name: currentDomain?.name,
          goal,
          expert,
        };
      })
      .filter((item) => item);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}
