// pages/api/quiz.js
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// type Context = {
//   params: {
//     country_id: string;
//     lang_code: string;
//     user_id: string;
//     job: string;
//   };
// };

export async function GET(request: NextRequest) {
  // const params = await context.params;
  // const countryCode = params.campaign_id;
  // const searchParams = new URL(request.url).searchParams;
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("user_id");
  const countryId = searchParams.get("country_id");
  const langCode = searchParams.get("lang_code");
  const userJob = searchParams.get("job");

  // const metadataId = searchParams.get('metadataId');

  if (!userId || !countryId || !langCode || !userJob) {
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

  try {
    // const questions = await prisma.countryUserJobQuestion.findMany({
    //   where: {
    //     countryId: countryId,
    //     // userJobName: userJob,
    //     isEnabled: true,
    //     userJobName: {
    //       contains: userJob, // 대소문자 무시 검색어
    //       mode: "insensitive", // 대소문자 구분 없음
    //     },
    //   },
    //   // include: {
    //   //   question: {
    //   //     include: {
    //   //       translations: {
    //   //         where: { languageCode: langCode },
    //   //       },
    //   //       options: {
    //   //         orderBy: { order: "asc" },
    //   //         include: {
    //   //           translations: {
    //   //             where: { languageCode: langCode },
    //   //           },
    //   //         },
    //   //       },
    //   //     },
    //   //   },
    //   // },
    // });
    const quizSets = await prisma.quizSet.findMany({
      where: {
        campaign: {
          quizSets: {
            some: {
              stages: {
                some: {
                  questions: {
                    some: {
                      countryUserJobQuestions: {
                        some: {
                          countryId: countryId,
                          userJobName: {
                            contains: userJob, // 대소문자 무시 검색어
                            mode: "insensitive", // 대소문자 구분 없음
                          },
                          isEnabled: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      include: {
        translations: {
          where: { languageCode: langCode },
        },
        stages: {
          orderBy: { order: "asc" },
          include: {
            questions: {
              include: {
                translations: {
                  where: { languageCode: langCode },
                },
                options: {
                  orderBy: { order: "asc" },
                  include: {
                    translations: {
                      where: { languageCode: langCode },
                    },
                  },
                },
                // countryUserJobQuestions: {
                //   where: {
                //     countryId: countryId,
                //     userJobName: {
                //       contains: userJob, // 대소문자 무시 검색어
                //       mode: "insensitive", // 대소문자 구분 없음
                //     },
                //     isEnabled: true,
                //   },
                //   include: {
                //     question: {},
                //   },
                // },
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
    return NextResponse.json({ items: quizSets }, { status: 200 });

    // return NextResponse.json(
    //   {
    //     status: 200,
    //     message: "Quiz data retrieved successfully",
    //     data: {
    //       // userQuizHistory,
    //       quizSets,
    //     },
    //   },
    //   { status: 200 }
    // );
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
