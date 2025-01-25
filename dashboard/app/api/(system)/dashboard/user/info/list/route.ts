import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

import { decrypt } from "@/utils/encrypt";
import { querySearchParams } from "@/app/api/(system)/dashboard/_lib/query";

// UserQuizStatistics, DomainGoal사용
// DomainGoal - ff,fsm,ffses,fsmses의 합이 국가별 총 목표수

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where, take, skip } = querySearchParams(searchParams);

    console.log(where);

    const { regionId, subsidiaryId, domainId, createdAt, authType } = where;

    await prisma.$connect();

    const count = await prisma.user.count({
      where: {
        authType,
        regionId,
        subsidiaryId,
        domainId,
        createdAt,
      },
    });

    const users = await prisma.user.findMany({
      where: {
        authType,
        regionId,
        subsidiaryId,
        domainId,
        createdAt,
      },
      take,
      skip,
    });

    const regions = await prisma.region.findMany();
    const subsidiaries = await prisma.subsidiary.findMany();
    const domains = await prisma.domain.findMany();

    const result = await Promise.all(
      users.map(async (user) => {
        const quizStatistics = await prisma.userQuizStatistics.findMany({
          where: {
            userId: user.id, // Ensure only statistics related to the current user are fetched
          },
        });
        let quizStatistic = null;
        if (quizStatistics.length == 1) {
          quizStatistic = quizStatistics[0];
        } else if (quizStatistics.length > 1) {
          quizStatistic = quizStatistics.filter(
            (statistic) => statistic.lastCompletedStage !== null,
          )[0];
        }

        if (!quizStatistic) {
          console.log("---- Not found UserQuizLog ----");
          return {
            id: user.id,
            authType: user.authType,
            region: regions.find((region) => region.id === user.regionId)?.name,
            subsidiary: subsidiaries.find(
              (subsidiary) => subsidiary.id === user.subsidiaryId,
            )?.name,
            domain: domains.find((domain) => domain.id === user.domainId)?.name,
            quizDomain: null,
            providerUserId: user.providerUserId
              ? decrypt(user.providerUserId!, true)
              : null,
            providerPersonId: user.providerPersonId
              ? decrypt(user.providerPersonId!, true)
              : null,
            badgeActivities: [],
            lastCompletedStage: null,
            score: null,
          };
        }

        const quizSet = await prisma.quizSet.findMany({
          where: { domainId: quizStatistic.domainId },
        });
        const quizStages = await prisma.quizStage.findMany({
          where: {
            quizSetId: quizSet[0].id,
          },
        });
        const badgeActivities = quizStages
          .filter((stage) => stage.isBadgeStage) // Filter stages that are badge stages
          .map((stage) => {
            return {
              order: stage.order,
              activityId: stage.badgeActivityId,
            };
          }); // Map to badgeActivityId

        return {
          id: user.id,
          authType: user.authType,
          region: regions.find((region) => region.id === user.regionId)?.name,
          subsidiary: subsidiaries.find(
            (subsidiary) => subsidiary.id === user.subsidiaryId,
          )?.name,
          domain: domains.find((domain) => domain.id === user.domainId)?.name,
          quizDomain: domains.find(
            (domain) => domain.id === quizStatistic.domainId,
          )?.name,
          providerUserId: user.providerUserId
            ? decrypt(user.providerUserId!, true)
            : null,
          providerPersonId: user.providerPersonId
            ? decrypt(user.providerPersonId!, true)
            : null,
          badgeActivities,
          lastCompletedStage: quizStatistic.lastCompletedStage,
          score: quizStatistic.score,
        };
      }),
    );

    return NextResponse.json({ result, total: count });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    prisma.$disconnect();
  }
}
