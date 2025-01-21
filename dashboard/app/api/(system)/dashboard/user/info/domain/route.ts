/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { querySearchParams } from "../../../_lib/query";
import { AuthType } from "@prisma/client";

// UserQuizStatistics, DomainGoal사용
// DomainGoal - ff,fsm,ffses,fsmses의 합이 국가별 총 목표수

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);

    await prisma.$connect();

    const defaultJobData = {
      ff: 0,
      fsm: 0,
      "ff(ses)": 0,
      "fsm(ses)": 0,
    };

    const jobGroup = await prisma.job.findMany({
      select: { id: true, group: true },
    });

    const domainsGoals = await prisma.domainGoal.findMany({
      where,
    });

    const experts = await prisma.userQuizBadgeStageStatistics.findMany({
      where: {
        ...where,
        isBadgeAcquired: true,
        domainId: {
          in: domainsGoals
            .map((goal) => goal.domainId)
            .filter((id): id is string => id !== null),
        },
      },
    });

    const domains = await prisma.domain.findMany({
      where: {
        id: {
          in: domainsGoals
            .map((goal) => goal.domainId)
            .filter((id): id is string => id !== null),
        },
      },
    });

    const subsidiaries = await prisma.subsidiary.findMany({
      where: {
        id: {
          in: domains
            .map((domain) => domain.subsidiaryId)
            .filter((id): id is string => id !== null),
        },
      },
    });

    const regions = await prisma.region.findMany({
      where: {
        id: {
          in: subsidiaries
            .map((subsidiary) => subsidiary.regionId)
            .filter((id): id is string => id !== null),
        },
      },
    });

    // Step 4: 데이터 매핑
    const result = domains.map((domain) => {
      const domainGoal = domainsGoals.find(
        (goal) => goal.domainId === domain.id
      );
      const goalTotal =
        (domainGoal?.ff || 0) +
        (domainGoal?.fsm || 0) +
        (domainGoal?.ffSes || 0) +
        (domainGoal?.fsmSes || 0);

      const subsidiary = subsidiaries.find(
        (sub) => sub.id === domain.subsidiaryId
      );
      const region = regions.find((reg) => reg.id === subsidiary?.regionId);

      const expertByDomain = experts.filter(
        (exp) => exp.domainId === domain.id
      );
      const advancedByDomain = expertByDomain.filter(
        (exp) => exp.quizStageId === "stage_3"
      );

      //   expers data
      const jobData = JSON.parse(JSON.stringify(defaultJobData));
      const plus = experts.filter(
        (exp) => exp.storeId !== "4" && exp.domainId === domain.id
      );
      plus.forEach((user) => {
        const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
        if (jobName) {
          const lowJobName = jobName.toLowerCase() as keyof typeof jobData;
          if (lowJobName in jobData) {
            jobData[lowJobName] += 1;
          }
        }
      });

      const ses = experts.filter(
        (exp) => exp.storeId === "4" && exp.domainId === domain.id
      );

      ses.forEach((user) => {
        const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
        if (jobName) {
          const lowJobName =
            `${jobName.toLowerCase()}(ses)` as keyof typeof jobData;
          if (lowJobName in jobData) {
            jobData[lowJobName] += 1;
          }
        }
      });

      const plusUsers = experts.filter(
        (exp) =>
          exp.authType === AuthType.SUMTOTAL && exp.domainId === domain.id
      );

      const noneUsers = experts.filter(
        (exp) =>
          exp.authType !== AuthType.SUMTOTAL && exp.domainId === domain.id
      );

      return {
        domain: { id: domain.id, name: domain.name },
        subsidiary: subsidiary
          ? { id: subsidiary.id, name: subsidiary.name }
          : null,
        region: region ? { id: region.id, name: region.name } : null,
        goal: goalTotal,
        expert: `${expertByDomain.length}(${advancedByDomain.length})`,
        achievement: expertByDomain.length / goalTotal,
        expertDetail: {
          date: domain.updatedAt || domain.createdAt,
          country: domain.name,
          plus: plusUsers.length,
          none: noneUsers.length,
          ...jobData,
        },
      };
    });

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
