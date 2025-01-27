export const dynamic = "force-dynamic";

import {prisma} from '@/model/prisma';
import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/auth';
import {decrypt} from '@/utils/encrypt';
import {querySearchParams} from '@/app/api/(system)/dashboard/_lib/query';
import {Account, Prisma} from '@prisma/client';
import {refreshToken} from '@/services/api/refresh_token';
import UserWhereInput = Prisma.UserWhereInput;

// UserQuizStatistics, DomainGoal사용
// DomainGoal - ff,fsm,ffses,fsmses의 합이 국가별 총 목표수

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const account = await prisma.account.findFirst({
      where: {
        userId: session?.user.id,
      },
    });

    const { searchParams } = request.nextUrl;
    const { where, take, skip } = querySearchParams(searchParams);

    console.log('where >> \n', where);

    const { regionId, subsidiaryId, domainId, createdAt, authType } = where;
    // Construct the dynamic where clause
    const whereClause: UserWhereInput = { authType, createdAt }; // Base condition with authType and createdAt

    if (domainId) {
      whereClause.domainId = domainId; // Use domainId if it's not "all"
    } else if (subsidiaryId) {
      whereClause.subsidiaryId = subsidiaryId; // Use subsidiaryId if it's not "all"
    } else if (regionId) {
      whereClause.regionId = regionId; // Use regionId if it's not "all"
    }

    await prisma.$connect();

    const count = await prisma.user.count({
      where: { ...whereClause },
    });

    const users = await prisma.user.findMany({
      where: whereClause,
      take,
      skip,
    });

    const regions = await prisma.region.findMany();
    const subsidiaries = await prisma.subsidiary.findMany();
    const domains = await prisma.domain.findMany();

    const result = await Promise.all(
      users.map(async (user) => {
        // const quizLog = await prisma.userQuizLog.findMany({
        //   where: {
        //     userId: user.id, // Ensure only statistics related to the current user are fetched
        //   },
        // });
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
            (statistic) => statistic.lastCompletedStage !== null
          )[0];
        }

        // console.log('---- START -------------------------------');
        // console.log('---- UserQuizLog ----');
        // console.log(quizLog);
        // console.log('---- UserQuizStatistics ----');
        // console.log(quizStatistics);
        // console.log('---- UserQuizStatistic ----');
        // console.log(quizStatistic);
        // console.log('---- END ---------------------------------');

        if (!quizStatistic) {
          console.log('---- Not found UserQuizLog ----');
          return {
            id: user.id,
            authType: user.authType,
            region: regions.find((region) => region.id === user.regionId)?.name,
            subsidiary: subsidiaries.find(
              (subsidiary) => subsidiary.id === user.subsidiaryId
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
          });

        const providerUserId = user.providerUserId
          ? decrypt(user.providerUserId!, true)
          : null;
        const providerPersonId = user.providerPersonId
          ? decrypt(user.providerPersonId!, true)
          : null;

        // Execute the testBadgeAttend function using activityId and userId
        const badgeActivitiesWithAttend = await Promise.all(
          badgeActivities.map(async (activity) => {
            const attend = await testBadgeAttend(
              account,
              providerUserId,
              activity.activityId
            );

            return {
              ...activity,
              hasAttended: attend.hasAttended, // Add the attend status to each badgeActivity
            } as BadgeActivity;
          })
        );

        return {
          id: user.id,
          authType: user.authType,
          region: regions.find((region) => region.id === user.regionId)?.name,
          subsidiary: subsidiaries.find(
            (subsidiary) => subsidiary.id === user.subsidiaryId
          )?.name,
          domain: domains.find((domain) => domain.id === user.domainId)?.name,
          quizDomain: domains.find(
            (domain) => domain.id === quizStatistic.domainId
          )?.name,
          providerUserId,
          providerPersonId,
          badgeActivities: badgeActivitiesWithAttend,
          lastCompletedStage: quizStatistic.lastCompletedStage,
          score: quizStatistic.score,
        };
      })
    );

    return NextResponse.json({ result, total: count });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}

const testBadgeAttend = async (
  account: Account | null,
  userId: string | null,
  activityId: string | null
) => {
  if (!account || !userId || !activityId) return { hasAttended: false };

  try {
    let response = await fetch(
      `https://samsung.sumtotal.host/apis/api/v1/users/${userId}/activities/${activityId}/progress/details`,
      {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${account.access_token}`, // 액세스 토큰 사용
        },
      }
    );
    if (response.status === 401) {
      const accessToken = await refreshToken(
        account.id,
        account.refresh_token || ''
      );

      response = await fetch(
        `https://samsung.sumtotal.host/apis/api/v1/users/${userId}/activities/${activityId}/progress/details`,
        {
          cache: 'no-store',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`, // 액세스 토큰 사용
          },
        }
      );
    }

    return response.json();
  } catch (error) {
    console.log('error >> ', error);
  }
};
