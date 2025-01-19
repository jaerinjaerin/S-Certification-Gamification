/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { querySearchParams } from "../../../_lib/query";
import { addWeeks, endOfWeek, startOfWeek } from "date-fns";
import { buildWhereWithValidKeys } from "../../../_lib/where";

// UserQuizStatistics, DomainGoal사용
// DomainGoal - ff,fsm,ffses,fsmses의 합이 국가별 총 목표수

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);
    console.log("🚀 ~ GET ~ where:", where);

    await prisma.$connect();

    const campaign = await prisma.campaign.findUnique({
      where: { id: where.campaignId },
    });

    if (!campaign?.startedAt || !campaign?.endedAt) {
      return NextResponse.json(
        { error: "Invalid campaign date range" },
        { status: 400 }
      );
    }

    const startDate = startOfWeek(campaign.startedAt); // 캠페인 시작 주
    const endDate = endOfWeek(campaign.endedAt); // 캠페인 종료 주const weeklyJobData = [];
    //
    let weekIndex = 1;
    let cumulativeGoalScore = 0; // 이전 주 누적 점수를 저장할 변수
    const weeklyJobData = [];
    const jobData = {
      ff: 0,
      fsm: 0,
      "ff(ses)": 0,
      "fsm(ses)": 0,
    };

    const jobGroup = await prisma.job.findMany({
      select: { id: true, group: true },
    });

    for (
      let currentWeekStart = startDate;
      currentWeekStart <= endDate;
      currentWeekStart = addWeeks(currentWeekStart, 1)
    ) {
      const weekEnd = endOfWeek(currentWeekStart);

      // 주간 조건: updatedAt이 주간 범위에 있거나, updatedAt이 null이고 createdAt이 주간 범위에 있는 경우
      const weeklyWhere = {
        ...where,
        OR: [
          {
            updatedAt: {
              gte: currentWeekStart,
              lt: weekEnd,
            },
          },
          {
            createdAt: {
              gte: currentWeekStart,
              lt: weekEnd,
            },
          },
        ],
      };

      const domain_goal = await prisma.domainGoal.findMany({
        where: {
          ...weeklyWhere,
          ...buildWhereWithValidKeys(where, ["campaignId", "createdAt"]),
        },
      });

      //
      const weeklyGoalScore = Array.isArray(domain_goal)
        ? domain_goal.reduce(
            (sum, { ff = 0, ffSes = 0, fsm = 0, fsmSes = 0 }) => {
              return sum + ff + fsm + ffSes + fsmSes;
            },
            0
          )
        : 0;

      // 이전 주 점수와 합산
      cumulativeGoalScore += weeklyGoalScore;

      const plus = await prisma.userQuizBadgeStageStatistics.findMany({
        where: { ...weeklyWhere, isBadgeAcquired: true, storeId: { not: "4" } },
      });

      plus.forEach((user) => {
        const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
        if (jobName) {
          const lowJobName = jobName.toLowerCase() as keyof typeof jobData; // 키 타입 제한
          if (lowJobName in jobData) {
            jobData[lowJobName] = jobData[lowJobName] + 1;
          }
        }
      });

      const ses = await prisma.userQuizBadgeStageStatistics.findMany({
        where: { ...weeklyWhere, isBadgeAcquired: true, storeId: "4" },
      });

      ses.forEach((user) => {
        const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
        if (jobName) {
          const lowJobName = jobName.toLowerCase();
          const jobNamewithSes = `${lowJobName}(ses)` as keyof typeof jobData; // 키 타입 제한;
          if (jobNamewithSes in jobData) {
            jobData[jobNamewithSes] = jobData[jobNamewithSes] + 1;
          }
        }
      });

      //
      // 결과 저장
      weeklyJobData.push({
        date: `${currentWeekStart.toISOString()} - ${weekEnd.toISOString()}`,
        name: `W${weekIndex}`,
        job: JSON.parse(JSON.stringify(jobData)),
        target: calculateTotalRatio(jobData, cumulativeGoalScore),
      });

      weekIndex++;
    }

    console.log("🚀 ~ GET ~ weeklyJobData:", weeklyJobData);
    return NextResponse.json({ result: weeklyJobData });
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

const calculateTotalRatio = (
  jobData: Record<string, number>,
  cumulativeGoalScore: number
) => {
  const total = Object.values(jobData).reduce((sum, value) => sum + value, 0); // jobData의 모든 값 합산

  // 비율 계산 (퍼센트로 변환)
  const percentage = cumulativeGoalScore
    ? (total / cumulativeGoalScore) * 100
    : 0; // cumulativeGoalScore가 0일 경우 대비

  return percentage;
};
