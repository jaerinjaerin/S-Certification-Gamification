import { ERROR_CODES } from '@/app/constants/error-codes';
import { auth } from '@/auth';
import { invalidateCache } from '@/lib/aws/cloudfront';
import { getS3Client } from '@/lib/aws/s3-client';
import {
  processExcelBuffer,
  ProcessResult,
  QuizData,
} from '@/lib/quiz-excel-parser';
import { prisma } from '@/model/prisma';
import { decrypt } from '@/utils/encrypt';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { BadgeType, FileType, QuestionType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import * as uuid from 'uuid';

export async function POST(request: NextRequest) {
  const session = await auth();

  try {
    // ✅ `req.body`를 `Buffer`로 변환 (Node.js `IncomingMessage`와 호환)
    const body = await request.formData();
    const campaignId = body.get('campaignId') as string;

    if (!campaignId) {
      console.error('Missing required parameter: campaign_id');
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

    // Get the file from the form data
    const file: File = body.get('file') as File;

    // Check if a file is received
    if (!file) {
      // If no file is received, return a JSON response with an error and a 400 status code
      console.error('No file received');
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

    // const jsonData = body.get('jsonData');
    // console.log('jsonData: ');

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const result: ProcessResult = processExcelBuffer(
      Buffer.from(fileBuffer),
      file.name
    );

    console.log('result: ', result);
    if (!result.success) {
      console.error('Error processing excel file: ', result.errors);
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              result.errors != null && result.errors.length > 0
                ? `${file.name}: ${result.errors[0].line} - ${result.errors[0].message}`
                : // result.errors[0]
                  `${file.name}: Unknown error`,
            code: ERROR_CODES.EXCEL_PROCESSING_ERROR,
          },
        },
        { status: 400 }
      );
    }

    if (!result.data) {
      console.error('No data found');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No data found',
            code: ERROR_CODES.NO_DATA_FOUND,
          },
        },
        { status: 400 }
      );
    }

    // ✅ Zod 검증 수행
    // const validatedData = updateQuizSetScheme.parse(
    //   JSON.parse(jsonData as string)
    // );

    const { domainCode, languageCode, jobGroup, questions } = result.data;
    if (!domainCode || !languageCode || !jobGroup) {
      console.error('Invalid file name');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: 파일명이 올바르지 않습니다.`,
            code: ERROR_CODES.INVALID_FILE_NAME,
          },
        },
        { status: 400 }
      );
    }

    if (!['ff', 'fsm'].includes(jobGroup)) {
      console.error('Invalid job code');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: Invalid job code. Must be "ff" or "fsm"`,
            code: ERROR_CODES.INVALID_JOB_GROUP,
          },
        },
        { status: 400 }
      );
    }

    // HQ 문제 언어 체크
    if (domainCode === 'OrgCode-7' && jobGroup === 'ff') {
      if (languageCode !== 'en') {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `${file.name}: Invalid language code. Must be "en"`,
              code: ERROR_CODES.INVALID_LANGUAGE_CODE,
            },
          },
          { status: 400 }
        );
      }
    }
    // const jobCodes = jobGroup === 'all' ? ['ff', 'fsm'] : [jobGroup];
    const jobCodes = [jobGroup];

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
      include: {
        settings: true,
      },
    });

    if (!campaign) {
      console.error('Campaign not found');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: Campaign not found`,
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
      console.error('Domain not found');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: Domain not found`,
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
      console.error('Language not found');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: Language not found`,
            code: ERROR_CODES.LANGUAGE_NOT_FOUND,
          },
        },
        { status: 400 }
      );
    }

    // 업로드 된 문제의 Stage가 캠페인 settings에 설정된 totalStages보다 큰지 확인
    const maxStage = Math.max(
      ...questions
        // .filter((question) => question.enabled)
        .map((question) => question.stage)
    );

    if (campaign.settings && campaign.settings.totalStages) {
      if (maxStage !== campaign.settings.totalStages + 1) {
        console.error('Stage exceeds total stages');
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `${file.name}: Stage mismatch. The maximum stage number should be ${campaign.settings.totalStages + 1}`,
              code: ERROR_CODES.STAGE_EXCEEDS_TOTAL_STAGES,
            },
          },
          { status: 400 }
        );
      }
    }

    const checkMissingStages = (
      questions: QuizData[],
      maxStage: number
    ): number[] => {
      // 1. 각 stage의 존재 여부를 확인하기 위한 Set 생성
      const filteredQuestions = questions.filter(
        (question) => question.enabled
      );
      const existingStages = new Set(
        filteredQuestions.map((question) => question.stage)
      );

      // 2. 1부터 maxStage까지의 숫자 중 없는 stage 찾기
      const missingStages = Array.from(
        { length: maxStage },
        (_, i) => i + 1
      ).filter((stage) => !existingStages.has(stage));

      return missingStages; // 비어 있는 stage 리스트 반환
    };

    const missingStages = checkMissingStages(questions, maxStage);
    console.log('missingStages: ', missingStages);

    console.log(
      missingStages.length === 0
        ? '✅ 모든 스테이지가 존재합니다.'
        : `🚨 누락된 스테이지: ${missingStages}`
    );

    if (missingStages.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: Missing stages: ${missingStages.join(', ')}`,
            code: ERROR_CODES.HQ_DOMAIN_NOT_FOUND,
          },
        },
        { status: 400 }
      );
    }

    // HQ 문제 불러오기
    const hqDomainCode = 'OrgCode-7';
    const hqMaxQuestionIndex = 100;
    const hqDomain = await prisma.domain.findFirst({
      where: {
        code: hqDomainCode,
      },
    });
    if (!hqDomain) {
      console.error('HQ Domain not found');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: HQ Domain not registered`,
            code: ERROR_CODES.HQ_DOMAIN_NOT_FOUND,
          },
        },
        { status: 400 }
      );
    }

    // const hqQuestions = await prisma.question.findMany({
    //   where: {
    //     domainId: hqDomain.id,
    //     campaignId: campaignId,
    //   },
    // });

    const hqQuizSet = await prisma.quizSet.findFirst({
      where: {
        campaignId: campaignId,
        domainId: hqDomain.id,
        // languageId: language.id,
        // languageId: 'bd97b21f-2beb-44b7-878d-e3fc4f81d23c',
        jobCodes: {
          equals: ['ff'],
        },
      },
      include: {
        questions: true,
      },
    });

    const hqQuestions = hqQuizSet?.questions ?? [];
    console.log('hqQuestions: ', domainCode, hqQuestions, jobGroup);

    // const isHqQuestions = domainCode === hqDomainCode && jobGroup === 'ff';
    const isHqQuestions = domainCode === hqDomainCode && jobGroup === 'ff';
    const isHqQuestionsRegistered = hqQuestions && hqQuestions.length > 0;
    if (!isHqQuestions && !isHqQuestionsRegistered) {
      console.error('HQ Questions not registered');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: HQ Questions not registered`,
            code: ERROR_CODES.HQ_QUESTIONS_NOT_REGISTERED,
          },
        },
        { status: 409 }
      );
    }

    // HQ 문제인 경우, 추가된 문제가 1번부터 100번까지만 가능
    if (isHqQuestions) {
      const hasHqQuestionsIndex = questions.some(
        (question) => question.originQuestionIndex > hqMaxQuestionIndex
      );

      if (hasHqQuestionsIndex) {
        console.error(
          'HQ Questions should be entered starting from number 1 to 100'
        );
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `${file.name}: For each domain, HQ Questions should be entered starting from number 1 to 100.`,
              code: ERROR_CODES.INVALID_QUESTION_INDEX,
            },
          },
          { status: 400 }
        );
      }
    }
    // HQ 문제가 아닌 경우, 추가된 문제가 101번부터 시작되어야 함
    else {
      const lastHqQuestionIndex = hqQuestions.reduce(
        (maxIndex, question) =>
          question.originalIndex > maxIndex ? question.originalIndex : maxIndex,
        0
      );

      const hasHqQuestionsIndex = questions.some(
        (question) =>
          question.originQuestionIndex <= hqMaxQuestionIndex &&
          question.originQuestionIndex > lastHqQuestionIndex
      );

      if (hasHqQuestionsIndex) {
        console.error(
          'Additional questions should be entered starting from number 101'
        );
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `${file.name}: For each domain, additional questions should be entered starting from number 101.`,
              code: ERROR_CODES.INVALID_QUESTION_INDEX,
            },
          },
          { status: 400 }
        );
      }
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

    // 엑셀에 입력된 이미지 중 등록되어 있지 않은 이미지가 있는지 확인
    const backgroundImageIds = questions
      .filter(
        (question) => question.enabled && question.backgroundImageId != null
      )
      .map((question) => question.backgroundImageId);

    const notRegisteredBackgroundImages = backgroundImageIds.filter(
      (id) => !backgroundImages.find((image) => image.title === id)
    );

    if (notRegisteredBackgroundImages.length > 0) {
      console.error('Background images not registered');
      const uniqueIds = [...new Set(notRegisteredBackgroundImages)];

      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: Background images not registered: ${uniqueIds.join(', ')}. You must register the image in the "Media Library" menu.`,
            code: ERROR_CODES.BACKGROUND_IMAGES_NOT_REGISTERED,
          },
        },
        { status: 400 }
      );
    }

    const characterImageIds = questions
      .filter(
        (question) => question.enabled && question.characterImageId != null
      )
      .map((question) => question.characterImageId);

    const notRegisteredCharacterImages = characterImageIds.filter(
      (id) => !characterImages.find((image) => image.title === id)
    );

    console.log('notRegisteredCharacterImages: ', notRegisteredCharacterImages);

    if (notRegisteredCharacterImages.length > 0) {
      console.error('Character images not registered');
      const uniqueIds = [...new Set(notRegisteredBackgroundImages)];

      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: Character images not registered: ${uniqueIds.join(', ')}. You must register the image in the "Media Library" menu.`,
            code: ERROR_CODES.CHARACTER_IMAGES_NOT_REGISTERED,
          },
        },
        { status: 400 }
      );
    }

    // =============================================
    // 1. quiz set 생성
    // =============================================
    let quizSet = await prisma.quizSet.findFirst({
      where: {
        campaignId: campaignId,
        domainId: domain.id,
        languageId: language.id,
        jobCodes: {
          equals: jobCodes, // 🔥 jobCodes 배열의 모든 값이 포함된 경우 조회
        },
      },
    });

    if (!quizSet) {
      quizSet = await prisma.quizSet.create({
        data: {
          campaignId: campaignId,
          domainId: domain.id,
          languageId: language.id,
          jobCodes: jobCodes,
          createrId: session?.user?.id ?? '',
          updaterId: session?.user?.id,
          // splusUserActive: false,
        },
      });
      await prisma.quizSetMeta.create({
        data: {
          quizSetId: quizSet.id,
          sPlusUserActive: false,
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
          updaterId: session?.user?.id,
        },
      });
    }

    const updatedByNameResult = await prisma.user.findUnique({
      where: { id: quizSet.updaterId ?? quizSet.createrId },
      select: { loginName: true },
    });

    quizSet = {
      ...quizSet,
      updatedBy: updatedByNameResult?.loginName
        ? decrypt(updatedByNameResult.loginName, true)
        : null,
    } as typeof quizSet & { updatedBy: string | null };

    // =============================================
    // 2. stages 생성
    // =============================================
    const stageNums: number[] = [
      ...new Set(
        questions
          .map((question) => question.stage)
          .filter((stage) => stage != null)
      ),
    ].sort();

    const createdStages = [];

    for (let i = 0; i < stageNums.length; i++) {
      const stage: number = stageNums[i];

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
            languageId: language.id,
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
      const newQuestionId = uuid.v4();

      // 이마 HQ 문제가 등록되어 있을 수 있으니, HQ 문제를 우선 찾아본다.
      let originalQuestionId =
        hqQuestions.find(
          (hqQ) => hqQ.originalIndex === questionJson.originQuestionIndex
        )?.id || null;

      // HQ 문제면 HQ 문제 아이디로 설정
      if (originalQuestionId == null && domainCode === hqDomainCode) {
        originalQuestionId = newQuestionId;
      }

      // 국가별로 추가된 문제는 추가된 문제 자체가 베이스 퀴즈가 됨.
      if (
        originalQuestionId == null &&
        questionJson.originQuestionIndex > hqMaxQuestionIndex
      ) {
        // 국가별로 추가된 문제가 먼저 등록되어 있는지 확인
        const originalQuestion = await prisma.question.findFirst({
          where: {
            originalIndex: questionJson.originQuestionIndex,
            languageId: language.id,
            campaignId: campaignId,
            domainId: domain.id,
            quizSetId: quizSet.id,
          },
        });

        if (originalQuestion) {
          originalQuestionId = originalQuestion.id;
        } else {
          originalQuestionId = newQuestionId;
        }
      }

      if (originalQuestionId == null) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `${file.name}: (${i})Original question not found or For each domain, additional questions should be entered starting from number 101.`,
              code: ERROR_CODES.HQ_QUESTION_NOT_FOUND,
            },
          },
          { status: 400 }
        );
      }

      let question = await prisma.question.findFirst({
        where: {
          originalQuestionId: originalQuestionId,
          // originalIndex: questionJson.originQuestionIndex,
          languageId: language.id,
          // campaignId: campaignId,
          // domainId: domain.id,
          quizSetId: quizSet.id,
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

      const quizStageId = createdStages.find(
        (stage) => stage.order === questionJson.stage
      )?.id;
      // 질문 생성
      if (!question) {
        question = await prisma.question.create({
          data: {
            id: newQuestionId,
            campaignId: campaignId,
            domainId: domain.id,
            languageId: language.id,
            originalQuestionId: originalQuestionId,
            originalIndex: questionJson.originQuestionIndex,
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
            quizStageId,
            quizSetId: quizSet.id,
          },
        });

        for (let j = 0; j < questionJson.options.length; j++) {
          const option = questionJson.options[j];
          await prisma.questionOption.findFirst({
            where: {
              questionId: question.id,
              order: j,
              languageId: language.id,
              quizSetId: quizSet.id,
            },
          });
          await prisma.questionOption.create({
            data: {
              text: option.text.toString(),
              order: j,
              questionId: question.id,
              isCorrect: option.answerStatus,
              languageId: language.id,
              campaignId,
              quizSetId: quizSet.id,
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
            quizStageId,
            quizSetId: quizSet.id,
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
            const optionJson = questionJson.options[j];
            await prisma.questionOption.create({
              data: {
                text: optionJson.text.toString(),
                order: j,
                questionId: question.id,
                isCorrect: optionJson.answerStatus,
                languageId: language.id,
                campaignId: campaignId,
                quizSetId: quizSet.id,
              },
            });
          }
        } else {
          // 기존 옵션에 변경 사항이 있으면 업데이트
          const sortedOptions = options.sort((a, b) => a.order - b.order);
          for (let index = 0; index < sortedOptions.length; index++) {
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
                  campaignId: campaignId,
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
    const s3Client = getS3Client();
    const destinationKey = `certification/${campaign.slug}/cms/upload/quizset/${domainCode}/${file.name}`;

    // 📌 S3 업로드 실행 (PutObjectCommand 사용)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.ASSETS_S3_BUCKET_NAME,
        Key: destinationKey,
        Body: fileBuffer,
      })
    );

    invalidateCache(process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID!, [
      `/${destinationKey}`,
    ]);

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
    console.error('Error create QuizSet: ', error);
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
  }
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
      include: {
        settings: true,
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

    const domains = await prisma.domain.findMany({
      include: {
        subsidiary: {
          include: {
            region: true,
          },
        },
      },
    });

    let quizSets = await prisma.quizSet.findMany({
      where: {
        campaignId: campaignId,
      },
      include: {
        language: true,
        meta: true,
        // quizStages: {
        //   include: {
        //     badgeImage: true,
        //     questions: {
        //       orderBy: {
        //         order: 'asc',
        //       },
        //       include: {
        //         options: {
        //           orderBy: {
        //             order: 'asc',
        //           },
        //         },
        //         backgroundImage: true,
        //         characterImage: true,
        //       },
        //     },
        //   },
        //   orderBy: {
        //     order: 'asc',
        //   },
        // },
      },
    });

    quizSets = await Promise.all(
      quizSets.map(async (qs) => {
        const updatedByNameResult = await prisma.user.findUnique({
          where: { id: qs.updaterId ?? qs.createrId },
          select: { loginName: true },
        });

        return {
          ...qs,
          updatedBy: updatedByNameResult?.loginName
            ? decrypt(updatedByNameResult.loginName, true)
            : null,
        };
      })
    );

    const quizSetFiles = await prisma.quizSetFile.findMany({
      where: {
        campaignId: campaignId,
      },
    });

    const uploadedFiles = await prisma.uploadedFile.findMany({
      where: {
        campaignId: campaignId,
        fileType: FileType.UI_LANGUAGE,
      },
    });

    const languages = await prisma.language.findMany();
    const uiLanguages = languages.filter(
      (lang) =>
        uploadedFiles.find((file) => file.languageId === lang.id) != null
    );

    quizSets.sort((a: any, b: any) => {
      const regionOrderA = a.domain?.subsidiary?.region?.order ?? Infinity;
      const regionOrderB = b.domain?.subsidiary?.region?.order ?? Infinity;
      if (regionOrderA !== regionOrderB) return regionOrderA - regionOrderB;

      const subsidiaryOrderA = a.domain?.subsidiary?.order ?? Infinity;
      const subsidiaryOrderB = b.domain?.subsidiary?.order ?? Infinity;
      if (subsidiaryOrderA !== subsidiaryOrderB)
        return subsidiaryOrderA - subsidiaryOrderB;

      const domainOrderA = a.domain?.order ?? Infinity;
      const domainOrderB = b.domain?.order ?? Infinity;
      if (domainOrderA !== domainOrderB) return domainOrderA - domainOrderB;

      // languageId 기준 정렬
      if (a.languageId !== b.languageId)
        return a.languageId.localeCompare(b.languageId);

      // jobCodes[0]이 ff인지 fsm인지에 따라 정렬
      const jobCodePriority = (jobCode: string) => {
        if (jobCode === 'ff') return 0;
        if (jobCode === 'fsm') return 1;
        return 2; // 기타 코드
      };

      const jobOrderA = jobCodePriority(a.jobCodes?.[0] ?? '');
      const jobOrderB = jobCodePriority(b.jobCodes?.[0] ?? '');

      return jobOrderA - jobOrderB;
    });

    const campaignSettings = await prisma.campaignSettings.findFirst({
      where: {
        campaignId: campaignId,
      },
    });
    const groupedQuizSets = quizSets.map((quizSet) => ({
      quizSet,
      quizSetFile: quizSetFiles
        .filter((file) => file.quizSetId === quizSet.id)
        .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))[0],
      domain: domains.find((domain) => domain.id === quizSet.domainId),
      campaign,
      activityBadges: activityBadges
        .filter(
          (badge) =>
            badge.jobCode === quizSet.jobCodes[0] &&
            badge.languageId === quizSet.languageId &&
            badge.domainId === quizSet.domainId
        )
        .sort((a, b) => (a.badgeType === BadgeType.FIRST ? -1 : 1)),
      uiLanguage: uiLanguages.find((lang) => lang.id === quizSet.languageId),
      // webLanguage: domainWebLanguages.find(
      //   (dwl) => dwl.domainId === quizSet.domainId
      // ),
    }));
    /*
    const noQuizSetActivityBadges = activityBadges.filter(
      (badge) =>
        !groupedQuizSets.find(
          (group) =>
            group.quizSet.domainId === badge.domainId &&
            group.quizSet.languageId === badge.languageId &&
            group.quizSet.jobCodes[0] === badge.jobCode
        )
    );

    
    // languageId와 jobCode를 기준으로 그룹화
    const groupedBadges = noQuizSetActivityBadges.reduce(
      (acc, badge) => {
        const key = `${badge.domainId}-${badge.languageId}-${badge.jobCode}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(badge);
        return acc;
      },
      {} as Record<string, typeof noQuizSetActivityBadges>
    );

    let extraGroupedQuizSets: any[] = [];

    if (Object.keys(groupedBadges).length > 0) {
      extraGroupedQuizSets = Object.values(groupedBadges).map((badges) => {
        return {
          quizSet: null,
          quizSetFile: null,
          domain: domains.find((domain) => domain.id === badges[0].domainId),
          campaign,
          activityBadges: badges, // 같은 languageId와 jobCode를 가진 배지들을 그룹화
          uiLanguage: uiLanguages.find(
            (lang) => lang.id === badges[0].languageId
          ),
        };
      });
    }
    */

    return NextResponse.json(
      {
        success: true,
        result: {
          // groupedQuizSets: [...groupedQuizSets, ...extraGroupedQuizSets],
          groupedQuizSets: groupedQuizSets,
          campaignSettings,
        },
      },
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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const quizSetId = searchParams.get('quizSetId');

  if (!quizSetId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Missing required parameter: quizSetId',
          code: ERROR_CODES.MISSING_REQUIRED_PARAMETER,
        },
      },
      { status: 400 }
    );
  }

  try {
    const quizSet = await prisma.quizSet.findFirst({
      where: {
        id: quizSetId,
      },
    });

    if (quizSet == null) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'QuizSet not found',
            code: ERROR_CODES.NO_DATA_FOUND,
          },
        },
        { status: 404 }
      );
    }

    await prisma.quizSet.delete({
      where: {
        id: quizSetId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error delete quizSet:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
