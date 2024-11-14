// pages/api/quiz.js
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

type Context = {
  params: { campaign_id: string }
}

export async function GET(request: NextRequest, context: Context) {
  const params = await context.params
  const countryCode = params.campaign_id
  const searchParams = new URL(request.url).searchParams

  const userId = searchParams.get('userId') as string
  const countryId = searchParams.get('countryId') as string
  const userJobId = searchParams.get('userJobId') as string
  // const metadataId = searchParams.get('metadataId');

  if (!userId || !countryCode) {
    return NextResponse.json(
      {
        status: 400,
        message: 'Missing required parameters',
        error: {
          code: 'BAD_REQUEST',
          details: 'userId, campaignId, and metadataId are required',
        },
      },
      { status: 400 }
    )
  }

  try {
    // // 유저의 UserQuizHistory를 가져옴
    // const userQuizHistory = await prisma.userQuizHistory.findFirst({
    //   where: {
    //     userId,
    //     campaignId: campaignId,
    //     metadataId: metadataId,
    //   },
    // });

    // console.log('userQuizHistory:', userQuizHistory);

    // // 해당 campaignId와 metadataId에 맞는 QuizSet 목록을 stage로 정렬하여 가져옴
    // const quizSets = await prisma.quizSet.findMany({
    //   where: {
    //     campaignId: campaignId,
    //     metadataId: metadataId,
    //     // metadata: {
    //     //   id: metadataId,
    //     //   // campaignId: campaignId,
    //     // },
    //   },
    //   orderBy: {
    //     stage: 'asc',
    //   },
    //   include: {
    //     questions: {
    //       include: {
    //         options: true,
    //       },
    //     },
    //   },
    // });

    // try {
    // Fetch quiz sets, stages, questions, and options for the specified country in English
    // Fetch Quiz Sets for Japan and Group B
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
                          userJobId: userJobId,
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
          where: { language: 'ja' },
        },
        stages: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              include: {
                translations: {
                  where: { language: 'ja' },
                },
                options: {
                  orderBy: { order: 'asc' },
                  include: {
                    translations: {
                      where: { language: 'ja' },
                    },
                  },
                },
                countryUserJobQuestions: {
                  where: {
                    countryId: countryId,
                    userJobId: userJobId,
                    isEnabled: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Transform the data for easier readability
    const result = quizSets.map((quizSet) => {
      return {
        quizSetName: quizSet.translations[0]?.text || quizSet.name,
        stages: quizSet.stages.map((stage) => {
          return {
            stageName: stage.name,
            questions: stage.questions.map((question) => {
              return {
                questionText: question.translations[0]?.text || question.text,
                options: question.options.map((option) => {
                  return {
                    optionText: option.translations[0]?.text || option.text,
                    isCorrect: option.order === 1, // Assuming the first option is correct
                  }
                }),
              }
            }),
          }
        }),
      }
    })

    console.log(JSON.stringify(result, null, 2))

    return NextResponse.json(
      {
        status: 200,
        message: 'Quiz data retrieved successfully',
        data: {
          // userQuizHistory,
          quizSets,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching quiz data:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: errorMessage,
        },
      },
      { status: 500 }
    )
  }
}
