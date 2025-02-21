import { ERROR_CODES } from '@/app/constants/error-codes';
import { auth } from '@/auth';
import { prisma } from '@/model/prisma';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { QuestionType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import * as uuid from 'uuid';
import { z } from 'zod';
const quizOptionSchema = z.object({
  text: z.string(),
  answerStatus: z.boolean(),
});

const quizQuestionSchema = z.object({
  originQuestionIndex: z.number(),
  orderInStage: z.number(),
  enabled: z.boolean(),
  stage: z.number(),
  product: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  specificFeature: z.string().nullable().optional(),
  importance: z.string().nullable().optional(),
  timeLimitSeconds: z.number(),
  text: z.string(),
  questionType: z.string(),
  options: z.array(quizOptionSchema),
  backgroundImageId: z.string(),
  characterImageId: z.string(),
});

// Zod를 사용한 입력 데이터 검증
const updateQuizSetScheme = z.object({
  campaignId: z.string(),
  domainCode: z.string(),
  languageCode: z.string(),
  jobGroup: z.string(),
  questions: z.array(quizQuestionSchema),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const sesstion = await auth();

  try {
    // ✅ `req.body`를 `Buffer`로 변환 (Node.js `IncomingMessage`와 호환)
    const body = await request.formData();

    // Get the file from the form data
    const file: File = body.get('file') as File;
    console.log('file: ', file);

    // Check if a file is received
    if (!file) {
      // If no file is received, return a JSON response with an error and a 400 status code
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No file received',
            errorCode: ERROR_CODES.NO_FILE_RECEIVED,
          },
        },
        { status: 400 }
      );
    }

    const jsonData = body.get('jsonData');
    console.log('jsonData: ');

    // ✅ Zod 검증 수행
    const validatedData = updateQuizSetScheme.parse(
      JSON.parse(jsonData as string)
    );
    const { campaignId, domainCode, languageCode, jobGroup, questions } =
      validatedData;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Campaign not found',
            code: ERROR_CODES.CAMPAIGN_NOT_FOUND,
          },
        },
        { status: 400 }
      );
    }

    const domain = await prisma.domain.findFirst({
      where: {
        code: domainCode,
      },
    });

    if (!domain) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Domain not found',
            code: ERROR_CODES.DOMAIN_NOT_FOUND,
          },
        },
        { status: 400 }
      );
    }

    const language = await prisma.language.findFirst({
      where: {
        code: languageCode,
      },
    });

    if (!language) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Language not found',
            code: ERROR_CODES.LANGUAGE_NOT_FOUND,
          },
        },
        { status: 400 }
      );
    }

    if (!['all', 'ff', 'fsm'].includes(jobGroup)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid job group',
            code: ERROR_CODES.INVALID_JOB_GROUP,
          },
        },
        { status: 400 }
      );
    }

    const jobCodes = jobGroup === 'all' ? ['ff', 'fsm'] : [jobGroup];

    // HQ 문제 불러오기
    const hqDomainCode = 'OrgCode-7';
    const hqMaxQuestionIndex = 100;
    const hqDomain = await prisma.domain.findFirst({
      where: {
        code: hqDomainCode,
      },
    });
    if (!hqDomain) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'HQ Domain not found',
            code: ERROR_CODES.HQ_DOMAIN_NOT_FOUND,
          },
        },
        { status: 400 }
      );
    }

    const hqQuestions = await prisma.question.findMany({
      where: {
        domainId: hqDomain.id,
        campaignId: campaignId,
      },
    });

    if (
      domainCode !== hqDomainCode &&
      (!hqQuestions || hqQuestions.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'HQ Questions not registered',
            code: ERROR_CODES.HQ_QUESTIONS_NOT_REGISTERED,
          },
        },
        { status: 409 }
      );
    }

    // 이미지 불러오기
    const backgroundImages =
      (await prisma.image.findMany({
        where: {
          campaignId: campaignId,
          alt: 'background',
        },
      })) ?? [];

    const characterImages =
      (await prisma.image.findMany({
        where: {
          campaignId: campaignId,
          alt: 'character',
        },
      })) ?? [];

    // =============================================
    // 1. quiz set 생성
    // =============================================
    let quizSet = await prisma.quizSet.findFirst({
      where: {
        campaignId: campaignId,
        domainId: domain.id,
        languageId: language.id,
        jobCodes: {
          hasEvery: jobCodes, // 🔥 jobCodes 배열의 모든 값이 포함된 경우 조회
        },
      },
    });

    if (quizSet) {
      const savedQuizSetFile = await prisma.quizSetFile.findFirst({
        where: {
          campaignId: campaignId,
          languageId: language.id,
          domainId: domain.id,
          quizSetId: quizSet.id,
        },
      });

      if (savedQuizSetFile) {
        console.log(
          'savedQuizSetFile: ',
          savedQuizSetFile.path.split('/').pop(),
          file.name
        );
        if (savedQuizSetFile.path.split('/').pop() !== file.name) {
          return NextResponse.json(
            {
              success: false,
              error: {
                message: 'File name does not match the existing file',
                code: ERROR_CODES.FILE_NAME_MISMATCH,
              },
            },
            { status: 400 }
          );
        }
      }
    }

    if (!quizSet) {
      quizSet = await prisma.quizSet.create({
        data: {
          campaignId: campaignId,
          domainId: domain.id,
          languageId: language.id,
          jobCodes: jobCodes,
          createrId: sesstion?.user?.id ?? '',
          updaterId: sesstion?.user?.id,
        },
      });
    } else {
      quizSet = await prisma.quizSet.update({
        where: {
          id: quizSet.id,
        },
        data: {
          // languageId: language.id,
          jobCodes: jobCodes,
          updaterId: sesstion?.user?.id,
        },
      });
    }

    // =============================================
    // 2. stages 생성
    // =============================================
    const stageNums = [
      ...new Set(questions.map((question) => question.stage)),
    ].sort();

    const createdStages = [];

    for (let i = 0; i < stageNums.length; i++) {
      const stage: number = stageNums[i];
      // const jsonStageQuestions: any[] = questions.filter(
      //   (question: any) => question.stage === stage && question.enabled
      // );

      // jsonStageQuestions.sort((a, b) => a.orderInStage - b.orderInStage);

      // 원본 질문 인덱스로 질문 아이디 매핑
      // let questionIds = jsonStageQuestions.map((question) => {
      //   const q: any = createdQuestions.find(
      //     (q: any) => q.originalIndex === question.originQuestionIndex
      //   );

      //   return q?.id;
      // });

      let quizStage = await prisma.quizStage.findFirst({
        where: {
          order: stage,
          quizSetId: quizSet.id,
          campaignId: campaignId,
        },
      });

      if (!quizStage) {
        quizStage = await prisma.quizStage.create({
          data: {
            name: stage.toString(),
            order: stage,
            campaignId: campaignId,
            domainId: domain.id,
            // questionIds,
            lifeCount: 5,
            quizSetId: quizSet.id,
          },
        });
      }

      createdStages.push(quizStage);
    }

    // =============================================
    // 3. question 생성
    // =============================================
    // const createdQuestions: Question[] = [];
    for (let i = 0; i < questions.length; i++) {
      const questionJson = questions[i];
      const questionId = uuid.v4();
      let originalQuestionId =
        hqQuestions.find(
          (hqQ) => hqQ.originalIndex === questionJson.originQuestionIndex
        )?.id || null;

      if (originalQuestionId == null && domainCode === hqDomainCode) {
        originalQuestionId = questionId;
      }

      // 국가별로 추가된 문제는 추가된 문제 자체가 베이스 퀴즈가 됨.
      if (
        originalQuestionId == null &&
        questionJson.originQuestionIndex > hqMaxQuestionIndex
      ) {
        originalQuestionId = questionId;
      }

      if (originalQuestionId == null) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Original question not found',
              code: ERROR_CODES.HQ_QUESTION_NOT_FOUND,
            },
          },
          { status: 400 }
        );
      }

      let question = await prisma.question.findFirst({
        where: {
          originalQuestionId: originalQuestionId,
          originalIndex: questionJson.originQuestionIndex,
          languageId: language.id,
        },
      });

      const backImage = backgroundImages.find(
        (image) => image.title === questionJson.backgroundImageId
      );

      const charImage = characterImages.find(
        (image) => image.title === questionJson.characterImageId
      );

      const backImageId = backImage != null ? backImage.id : null;
      const charImageId = charImage != null ? charImage.id : null;

      // 질문 생성
      if (!question) {
        question = await prisma.question.create({
          data: {
            id: questionId,
            campaignId: campaignId,
            domainId: domain.id,
            text: questionJson.text.toString(),
            timeLimitSeconds: questionJson.timeLimitSeconds,
            languageId: language.id,
            originalQuestionId: originalQuestionId,
            originalIndex: questionJson.originQuestionIndex,
            category: questionJson.category,
            specificFeature: questionJson.specificFeature ?? '',
            importance: questionJson.importance,
            enabled: questionJson.enabled,
            product: questionJson.product,
            questionType: questionJson.questionType as QuestionType,
            order: questionJson.orderInStage,
            backgroundImageId: backImageId,
            characterImageId: charImageId,
            quizStageId: createdStages.find(
              (stage) => stage.order === questionJson.stage
            )?.id,
          },
        });

        for (let j = 0; j < questionJson.options.length; j++) {
          const option = questionJson.options[j];
          await prisma.questionOption.findFirst({
            where: {
              questionId,
              order: j,
              languageId: language.id,
            },
          });
          await prisma.questionOption.create({
            data: {
              text: option.text.toString(),
              order: j,
              questionId,
              isCorrect: option.answerStatus,
              languageId: language.id,
            },
          });
        }
      } else {
        // 질문 업데이트
        question = await prisma.question.update({
          where: {
            id: question.id,
          },
          data: {
            text: questionJson.text.toString(),
            timeLimitSeconds: questionJson.timeLimitSeconds,
            category: questionJson.category,
            specificFeature: questionJson.specificFeature ?? '',
            importance: questionJson.importance,
            enabled: questionJson.enabled,
            product: questionJson.product,
            questionType: questionJson.questionType as QuestionType,
            order: questionJson.orderInStage,
            backgroundImageId: backImageId,
            characterImageId: charImageId,
            quizStageId: createdStages.find(
              (stage) => stage.order === questionJson.stage
            )?.id,
          },
        });

        // 옵션 불러오기
        const options = await prisma.questionOption.findMany({
          where: {
            questionId: question.id,
          },
        });

        // 옵션 개수가 변경되었으면 기존 옵션들 삭제 후 재생성
        if (options.length !== questionJson.options.length) {
          await prisma.questionOption.deleteMany({
            where: {
              questionId: question.id,
            },
          });

          for (let j = 0; j < questionJson.options.length; j++) {
            const option = questionJson.options[j];
            await prisma.questionOption.findFirst({
              where: {
                questionId,
                order: j,
                languageId: language.id,
              },
            });
            await prisma.questionOption.create({
              data: {
                text: option.text.toString(),
                order: j,
                questionId,
                isCorrect: option.answerStatus,
                languageId: language.id,
              },
            });
          }
        } else {
          // 기존 옵션에 변경 사항이 있으면 업데이트
          const sortedOptions = options.sort((a, b) => a.order - b.order);
          for (var index = 0; index < sortedOptions.length; index++) {
            const option = options[index];
            if (
              option.text !== questionJson.options[index].text ||
              option.isCorrect !== questionJson.options[index].answerStatus
            ) {
              await prisma.questionOption.update({
                where: {
                  id: option.id,
                },
                data: {
                  text: questionJson.options[index].text.toString(),
                  isCorrect: questionJson.options[index].answerStatus,
                },
              });
            }
          }
        }
      }
    }

    // =============================================
    // file upload
    // =============================================

    // const file = files.file?.[0];
    const s3Client =
      process.env.ENV === 'local'
        ? new S3Client({
            region: process.env.ASSETS_S3_BUCKET_REGION,
            credentials: fromIni({
              profile: process.env.ASSETS_S3_BUCKET_PROFILE,
            }),
          })
        : new S3Client({
            region: process.env.ASSETS_S3_BUCKET_REGION,
          });

    // if (file) {

    // const fileContent = await fs.readFile(file.filepath);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 12); // YYYYMMDDHHMM 형식

    // 기존 파일명에서 모든 _YYYYMMDDHHMM 패턴 제거
    const baseFileName = file.name
      .replace(/(_\d{12})+/, '')
      .replace(/\.[^/.]+$/, '');
    const fileExtension = file.name.match(/\.[^/.]+$/)?.[0] || '';

    // 최종 파일명 생성 (중복된 날짜 제거 후 새 날짜 추가)
    const fileNameWithTimestamp = `${baseFileName}_${timestamp}${fileExtension}`;

    const destinationKey = `certification/${campaign.slug}/cms/upload/quizset/${domainCode}/${fileNameWithTimestamp}`;

    // 📌 S3 업로드 실행 (PutObjectCommand 사용)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.ASSETS_S3_BUCKET_NAME,
        Key: destinationKey,
        Body: fileBuffer,
      })
    );

    let quizSetFile = await prisma.quizSetFile.findFirst({
      where: {
        quizSetId: quizSet.id,
        campaignId: campaign.id,
        languageId: language.id,
        domainId: domain.id,
      },
    });

    if (quizSetFile) {
      quizSetFile = await prisma.quizSetFile.update({
        where: {
          id: quizSetFile.id,
        },
        data: {
          jobCodes: jobCodes,
          path: `/${destinationKey}`,
        },
      });
    } else {
      quizSetFile = await prisma.quizSetFile.create({
        data: {
          quizSetId: quizSet.id,
          campaignId: campaign.id,
          languageId: language.id,
          domainId: domain.id,
          jobCodes: jobCodes,
          path: `/${destinationKey}`,
        },
      });
    }

    return NextResponse.json(
      { success: true, quizSet, quizSetFile },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error create campaign: ', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: ERROR_CODES.UNKNOWN,
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
  // });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');

  if (!campaignId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Missing required parameter: campaign_id',
          code: ERROR_CODES.MISSING_REQUIRED_PARAMETER,
        },
      },
      { status: 400 }
    );
  }

  const activityBadges = await prisma.activityBadge.findMany({
    where: {
      campaignId: campaignId,
    },
    include: {
      badgeImage: true,
    },
  });

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
    });

    if (campaign == null) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Campaign not found',
            code: ERROR_CODES.CAMPAIGN_NOT_FOUND,
          },
        },
        { status: 404 }
      );
    }

    const quizSets = await prisma.quizSet.findMany({
      where: {
        campaignId: campaignId,
      },
      include: {
        domain: {
          include: {
            subsidiary: {
              include: {
                region: true,
              },
            },
          },
        },
        language: true,
        quizStages: {
          include: {
            badgeImage: true,
            questions: {
              orderBy: {
                order: 'asc',
              },
              include: {
                options: {
                  orderBy: {
                    order: 'asc',
                  },
                },
                backgroundImage: true,
                characterImage: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    const quizSetFiles = await prisma.quizSetFile.findMany({
      where: {
        campaignId: campaignId,
      },
    });

    const groupedQuizSets = quizSets.map((quizSet) => ({
      quizSet,
      quizSetFile: quizSetFiles
        .filter((file) => file.quizSetId === quizSet.id)
        .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))[0],
    }));

    console.log('groupedQuizSets: ', groupedQuizSets);

    return NextResponse.json(
      { success: true, result: { groupedQuizSets, activityBadges } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
