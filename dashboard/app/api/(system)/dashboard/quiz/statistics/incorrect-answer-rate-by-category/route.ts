/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { querySearchParams } from "../../../_lib/query";
import { AuthType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);

    await prisma.$connect();

    const jobNames = await prisma.job.findMany({
      select: { id: true, group: true },
    });

    const questions = await prisma.userQuizQuestionStatistics.findMany({
      where: { ...where },
    });

    const result: Record<string, any> = {};
    // Iterate through each question
    questions.forEach((question) => {
      const { category: cate, authType, isCorrect, jobId } = question;

      // Ensure category is a string (fallback to empty string if null/undefined)
      const category = cate || "";

      // Initialize or retrieve the existing category data
      if (!result[category]) {
        result[category] = {
          pff: 0,
          pfsm: 0,
          nff: 0,
          nfsm: 0,
          corrects: {
            p: { correct: 0, incorrect: 0 },
            n: { correct: 0, incorrect: 0 },
          },
        };
      }

      const item = result[category];

      // Find the job group (e.g., "ff" or "fsm")
      const jobName = jobNames.find((job) => job.id === jobId)?.group;

      if (jobName) {
        const group = authType === AuthType.SUMTOTAL ? "p" : "n";
        item.corrects[group][isCorrect ? "correct" : "incorrect"] += 1;
        // Calculate the incorrect rate
        const incorrect = item.corrects[group].incorrect;
        const total = item.corrects[group].correct + incorrect;
        const rate = incorrect / total;
        // Update the respective rate (pff, pfsm, nff, nfsm)
        if (jobName === "ff") {
          item[`${group}ff`] = rate;
        } else if (jobName === "fsm") {
          item[`${group}fsm`] = rate;
        }
      }
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
