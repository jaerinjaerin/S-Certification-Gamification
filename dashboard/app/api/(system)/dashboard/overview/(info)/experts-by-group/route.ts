import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { buildWhereCondition } from "../../../_lib/where";
import { parseDateFromQuery } from "../../../_lib/query";
import { initialExpertsData } from "@/app/(system)/dashboard/overview/(infos)/@experts-by-group/_lib/state";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const period = parseDateFromQuery(params);
    const where = buildWhereCondition(params, period);

    await prisma.$connect();

    const expertsData: ImprovedDataStructure = JSON.parse(
      JSON.stringify(initialExpertsData)
    );

    const jobGroup = await prisma.job.findMany({
      select: { id: true, group: true },
    });

    const plus = await prisma.userQuizStatistics.findMany({
      where: { ...where, isCompleted: true, storeId: { not: "4" } },
    });

    plus.forEach((user) => {
      const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
      if (jobName) {
        expertsData[0].items.forEach((item) => {
          if (item.title === jobName) {
            item.value++;
          }
        });
      }
    });

    const ses = await prisma.userQuizStatistics.findMany({
      where: { ...where, isCompleted: true, storeId: "4" },
    });

    ses.forEach((user) => {
      const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
      if (jobName) {
        expertsData[1].items.forEach((item) => {
          if (item.title === jobName) {
            item.value++;
          }
        });
      }
    });

    return NextResponse.json({ result: expertsData });
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
