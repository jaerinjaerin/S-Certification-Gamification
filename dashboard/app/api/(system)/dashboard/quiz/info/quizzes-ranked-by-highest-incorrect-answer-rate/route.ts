/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '@/lib/query';
import { Question } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, storeId, ...restWhere } = condition;

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    const questions: Question[] = await prisma.$queryRaw`
      SELECT q.*
      FROM "Question" q
      JOIN "Language" l ON q."languageId" = l."id"
      WHERE q."id" = q."originalQuestionId"
      AND l."code" = 'en-US'
      ORDER BY q."order" ASC
    `;

    const where = {
      ...restWhere,
      category: { not: null },
      questionId: { in: questions.map((q) => q.id) },
      jobId: { in: jobGroup.map((job) => job.id) },
      ...(storeId
        ? storeId === '4'
          ? { storeId }
          : { OR: [{ storeId }, { storeId: null }] }
        : {}),
    };

    // 모든 isCorrect가 있는 데이터 가져오기
    const corrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ['questionId'], // 그룹화 기준 필드는 questionId만 포함
      where: { ...where, isCorrect: true },
      _count: {
        isCorrect: true,
      },
    });

    const incorrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ['questionId'], // 그룹화 기준 필드는 questionId만 포함
      where: { ...where, isCorrect: false },
      _count: {
        isCorrect: true,
      },
    });

    const groupedMap = new Map();

    corrects.forEach(({ questionId, _count }) => {
      if (!groupedMap.has(questionId)) {
        groupedMap.set(questionId, {
          correct: 0,
          incorrect: 0,
          errorRate: 0,
        });
      }
      //
      const categoryItem = groupedMap.get(questionId);
      categoryItem.correct += _count.isCorrect;
    });

    incorrects.forEach(({ questionId, _count }) => {
      if (!groupedMap.has(questionId)) {
        groupedMap.set(questionId, {
          correct: 0,
          incorrect: 0,
          errorRate: 0,
        });
      }
      //
      const categoryItem = groupedMap.get(questionId);
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
