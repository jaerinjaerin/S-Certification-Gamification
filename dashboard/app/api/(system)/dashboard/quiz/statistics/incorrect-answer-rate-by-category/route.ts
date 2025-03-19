/* eslint-disable @typescript-eslint/no-explicit-any */

import { querySearchParams } from '@/lib/query';
import { extendedQuery } from '@/lib/sql';
import { prisma } from '@/model/prisma';
import { AuthType, Job } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, storeId, ...restWhere } = condition;

    // 필터링된 `jobId` 가져오기
    const jobGroup: Job[] = await extendedQuery(
      prisma,
      'Job',
      jobId ? { code: jobId } : {},
      { select: ['id', 'code'] }
    );

    const hqQuizSet = await prisma.quizSet.findFirst({
      where: {
        campaignId: restWhere.campaignId,
        domainId: '29',
        languageId: 'bd97b21f-2beb-44b7-878d-e3fc4f81d23c',
        jobCodes: { has: 'ff' },
      },
      include: {
        questions: true,
      },
    });

    const questions = hqQuizSet?.questions || [];

    // 필터링된 `originalQuestionId` 가져오기
    // const questions: Question[] = await prisma.$queryRaw`
    //   SELECT q.*
    //   FROM "Question" q
    //   -- JOIN "Language" l ON q."languageId" = l."id"
    //   WHERE q."id" = q."originalQuestionId"
    //   AND q."campaignId" = ${restWhere.campaignId}
    //   -- AND l."code" = 'en-US'
    //   AND q."domainId" = '29'
    //   ORDER BY q."order" ASC
    // `;

    const where = {
      ...restWhere,
      category: { not: null },
      originalQuestionId: { in: questions.map((q) => q.id) },
      jobId: { in: jobGroup.map((job) => job.id) },
      ...(storeId
        ? storeId === '4'
          ? { storeId }
          : { OR: [{ storeId }, { storeId: null }] }
        : {}),
    };

    // `correct` 및 `incorrect` 개수 조회 (필터 적용됨)
    const corrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ['category', 'originalQuestionId', 'authType', 'jobId'],
      where: {
        ...where,
        isCorrect: true,
      },
      _count: { isCorrect: true },
    });

    const incorrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ['category', 'originalQuestionId', 'authType', 'jobId'],
      where: {
        ...where,
        isCorrect: false,
      },
      _count: { isCorrect: true },
    });

    // 히트맵 데이터 그룹화
    const groupedMap = new Map();

    corrects.forEach(
      ({ category, originalQuestionId, authType, jobId, _count }) => {
        const jobName = jobGroup.find((job) => job.id === jobId)?.code;
        if (!jobName) return;

        const authName = authType === AuthType.SUMTOTAL ? 'plus' : 'none';
        const mapName = `${category}:${authName}-${jobName}`;

        if (!groupedMap.has(mapName)) {
          groupedMap.set(mapName, {
            correct: 0,
            incorrect: 0,
            rate: 0,
            questions: new Map(), // `questions`을 `Map`으로 변경하여 `originalQuestionId`별로 저장
          });
        }

        const categoryItem = groupedMap.get(mapName);
        categoryItem.correct += _count.isCorrect;

        if (!categoryItem.questions.has(originalQuestionId)) {
          categoryItem.questions.set(originalQuestionId, {
            correct: 0,
            incorrect: 0,
            errorRate: 0,
          });
        }

        // 각 `originalQuestionId`에 대해 `correct` 값을 누적 저장
        categoryItem.questions.get(originalQuestionId).correct +=
          _count.isCorrect;
      }
    );

    incorrects.forEach(
      ({ category, originalQuestionId, authType, jobId, _count }) => {
        const jobName = jobGroup.find((job) => job.id === jobId)?.code;
        if (!jobName) return;

        const authName = authType === AuthType.SUMTOTAL ? 'plus' : 'none';
        const mapName = `${category}:${authName}-${jobName}`;

        if (!groupedMap.has(mapName)) {
          groupedMap.set(mapName, {
            correct: 0,
            incorrect: 0,
            rate: 0,
            questions: new Map(), // `questions`을 `Map`으로 변경하여 `originalQuestionId`별로 저장
          });
        }

        const categoryItem = groupedMap.get(mapName);
        categoryItem.incorrect += _count.isCorrect;

        if (!categoryItem.questions.has(originalQuestionId)) {
          categoryItem.questions.set(originalQuestionId, {
            correct: 0,
            incorrect: 0,
            errorRate: 0,
          });
          //
        }

        // 각 `originalQuestionId`에 대해 `incorrect` 값을 누적 저장
        categoryItem.questions.get(originalQuestionId).incorrect +=
          _count.isCorrect;
      }
    );

    // 각 카테고리별 오답율
    groupedMap.forEach((data) => {
      const total = data.correct + data.incorrect;
      data.rate = total === 0 ? 0 : (data.incorrect / total) * 100;
    });

    // `errorRate` 계산 추가
    groupedMap.forEach((data) => {
      data.questions.forEach((values: any) => {
        const total = values.correct + values.incorrect;
        values.errorRate = total === 0 ? 0 : (values.incorrect / total) * 100;
      });
    });

    // 1. `questionMap` 생성 (기본값 포함)
    const questionMap = new Map(
      questions.map((q) => [
        q.id,
        { ...q, correct: 0, incorrect: 0, errorRate: 0 },
      ])
    );

    const jobtypes = {
      'plus-fsm': 'S+ FSM',
      'plus-ff': 'S+ FF',
      'none-fsm': 'Non S+ FSM',
      'none-ff': 'Non S+ FF',
    };
    // 히트맵 및 개별 `question` 정보 포함 결과 생성
    const result = Array.from(groupedMap, ([name, data]) => {
      const [category, type] = name.split(':');
      const userType = jobtypes[type as keyof typeof jobtypes];

      // `questions`에 대해 `questionMap`을 사용하여 매핑
      const formattedQuestions = Array.from(data.questions, ([id, values]) => {
        const question = questionMap.get(id);
        if (question) {
          return {
            ...question,
            correct: values.correct,
            incorrect: values.incorrect,
            errorRate: values.errorRate,
          };
        }
        return null;
      }).filter((q) => q);

      return {
        id: category,
        data: [
          {
            x: userType, // `userType`을 `x` 값으로 사용
            y: data.rate, // `userType`별 rate 값
            meta: {
              questions: formattedQuestions, // `{ id, errorRate, ...question }` 형태로 저장
            },
          },
        ],
      };
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { result: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
