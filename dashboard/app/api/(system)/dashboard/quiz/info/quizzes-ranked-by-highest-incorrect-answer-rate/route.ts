/* eslint-disable @typescript-eslint/no-explicit-any */

import { querySearchParams } from '@/lib/query';
import { extendedQuery } from '@/lib/sql';
import { prisma } from '@/model/prisma';
import { Job, Question } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, storeId, ...restWhere } = condition;

    const jobGroup: Job[] = await extendedQuery(
      prisma,
      'Job',
      jobId ? { code: jobId } : {},
      { select: ['id', 'code'] }
    );

    const questions: Question[] = await prisma.$queryRaw`
      SELECT q.*
      FROM "Question" q
      -- JOIN "Language" l ON q."languageId" = l."id"
      WHERE q."id" = q."originalQuestionId"
      AND q."campaignId" = ${restWhere.campaignId}
      AND q."domainId" = '29'
      -- AND l."code" = 'en-US'
      ORDER BY q."order" ASC
    `;

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

    // 모든 isCorrect가 있는 데이터 가져오기
    const corrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ['originalQuestionId'], // 그룹화 기준 필드는 originalQuestionId만 포함
      where: { ...where, isCorrect: true },
      _count: {
        isCorrect: true,
      },
    });

    const incorrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ['originalQuestionId'], // 그룹화 기준 필드는 originalQuestionId만 포함
      where: { ...where, isCorrect: false },
      _count: {
        isCorrect: true,
      },
    });

    const groupedMap = new Map();

    corrects.forEach(({ originalQuestionId, _count }) => {
      if (!groupedMap.has(originalQuestionId)) {
        groupedMap.set(originalQuestionId, {
          correct: 0,
          incorrect: 0,
          errorRate: 0,
        });
      }
      //
      const categoryItem = groupedMap.get(originalQuestionId);
      categoryItem.correct += _count.isCorrect;
    });

    incorrects.forEach(({ originalQuestionId, _count }) => {
      if (!groupedMap.has(originalQuestionId)) {
        groupedMap.set(originalQuestionId, {
          correct: 0,
          incorrect: 0,
          errorRate: 0,
        });
      }
      //
      const categoryItem = groupedMap.get(originalQuestionId);
      categoryItem.incorrect += _count.isCorrect;
    });

    // 각 카테고리별 오답율
    groupedMap.forEach((data) => {
      const total = data.correct + data.incorrect;
      data.errorRate = total === 0 ? 0 : (data.incorrect / total) * 100;
    });

    const questionMap = new Map(
      questions.map((q) => [
        q.id,
        { ...q, correct: 0, incorrect: 0, errorRate: 0 },
      ])
    );

    const result = Array.from(groupedMap, ([id, data]) => {
      const question = questionMap.get(id);
      if (question) {
        return {
          ...question,
          correct: data.correct,
          incorrect: data.incorrect,
          errorRate: data.errorRate,
        };
      }
      return null;
    }).filter((q) => q);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { result: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
