import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const campaignId = searchParams.get("campaignId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!campaignId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "campaignId, startDate, and endDate are required." },
        { status: 400 }
      );
    }

    // Define FSM Job IDs and Store ID for SES classification
    const fsmJobIds = new Set(["1", "2", "3", "7", "8", "10"]);
    const sesStoreId = "4";

    // Fetch all relevant user quiz logs
    const userQuizLogs = await prisma.userQuizLog.findMany({
      where: {
        campaignId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        authType: true,
        jobId: true,
        storeId: true,
      },
    });

    // Classification and aggregation
    const totals = {
      totalExperts: userQuizLogs.length,
      sPlusUsers: 0,
      nonSPlusUsers: 0,
      breakdown: {
        sPlus: { FF: 0, FSM: 0, FF_SES: 0, FSM_SES: 0 },
        nonSPlus: { FF: 0, FSM: 0, FF_SES: 0, FSM_SES: 0 },
      },
    };

    for (const log of userQuizLogs) {
      const isFSM = fsmJobIds.has(log.jobId || "");
      const isSES = log.storeId === sesStoreId;

      if (log.authType === "SUMTOTAL") {
        totals.sPlusUsers += 1;

        if (isFSM) {
          if (isSES) {
            totals.breakdown.sPlus.FSM_SES += 1;
          } else {
            totals.breakdown.sPlus.FSM += 1;
          }
        } else {
          if (isSES) {
            totals.breakdown.sPlus.FF_SES += 1;
          } else {
            totals.breakdown.sPlus.FF += 1;
          }
        }
      } else if (log.authType === "GUEST") {
        totals.nonSPlusUsers += 1;

        if (isFSM) {
          if (isSES) {
            totals.breakdown.nonSPlus.FSM_SES += 1;
          } else {
            totals.breakdown.nonSPlus.FSM += 1;
          }
        } else {
          if (isSES) {
            totals.breakdown.nonSPlus.FF_SES += 1;
          } else {
            totals.breakdown.nonSPlus.FF += 1;
          }
        }
      }
    }

    return NextResponse.json(totals, { status: 200 });
  } catch (error) {
    console.error("Error in fetching data:", error);
    return NextResponse.json(
      { message: "Error fetching data", error },
      { status: 500 }
    );
  }
}
