import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const activityId = searchParams.get("activity_id");
  const langCode = searchParams.get("lang_code");

  if (!activityId || !langCode) {
    return NextResponse.json(
      {
        status: 400,
        message: "Missing required parameters",
        error: {
          code: "BAD_REQUEST",
          details: "userId, campaignId, and metadataId are required",
        },
      },
      { status: 400 }
    );
  }

  const campaignActivity = await prisma.campaignActivity.findFirst({
    where: {
      id: activityId,
    },
    include: {
      country: true,
      campaign: true,
    },
  });

  if (campaignActivity === null) {
    return NextResponse.json(
      {
        status: 404,
        message: "Not found",
        error: {
          code: "NOT_FOUND",
          details: "Campaign activity not found",
        },
      },
      { status: 404 }
    );
  }

  try {
    const campaignStages = await prisma.campaign.findMany({
      where: {
        id: campaignActivity.campaignId, // 특정 캠페인 ID를 기반으로 필터링
        quizStage: {
          some: {
            questions: {
              some: {
                questionUsages: {
                  some: {
                    countryId: campaignActivity.countryId, // 특정 국가 ID
                    userJobName: {
                      contains: campaignActivity.jobId, // 사용자 직업 이름 대소문자 구분 없이 검색
                      mode: "insensitive",
                    },
                    isEnabled: true, // 질문 사용 가능 여부
                  },
                },
              },
            },
          },
        },
      },
      include: {
        quizStage: {
          orderBy: { order: "asc" }, // 스테이지를 오름차순으로 정렬
          include: {
            questions: {
              include: {
                translations: {
                  where: { languageCode: langCode }, // 특정 언어 코드의 번역만 포함
                },
                options: {
                  orderBy: { order: "asc" }, // 선택지를 오름차순으로 정렬
                  include: {
                    translations: {
                      where: { languageCode: langCode }, // 특정 언어 코드의 선택지 번역만 포함
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform the data for easier readability
    // const result = quizSets.map((quizSet: any) => {
    //   return {
    //     quizSetName: quizSet.translations[0]?.text || quizSet.name,
    //     stages: quizSet.stages.map((stage: any) => {
    //       return {
    //         stageName: stage.name,
    //         questions: stage.questions.map((question: any) => {
    //           return {
    //             questionText: question.translations[0]?.text || question.text,
    //             options: question.options.map((option: any) => {
    //               return {
    //                 optionText: option.translations[0]?.text || option.text,
    //                 isCorrect: option.order === 1, // Assuming the first option is correct
    //               };
    //             }),
    //           };
    //         }),
    //       };
    //     }),
    //   };
    // });

    // console.log(JSON.stringify(result, null, 2));
    return NextResponse.json({ items: campaignStages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching quiz data:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        error: {
          code: "INTERNAL_SERVER_ERROR",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
