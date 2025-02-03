/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../_lib/query';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, take, skip } = querySearchParams(searchParams);
    const { jobId, ...where } = condition;

    await prisma.$connect();

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { group: jobId } : {},
      select: { id: true, group: true },
    });

    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const count = await prisma.userQuizQuestionStatistics.groupBy({
      by: ['questionId'], // questionId와 isCorrect를 기준으로 그룹핑
      where: {
        ...where,
        questionId: { in: questions.map((q) => q.id) },
        jobId: { in: jobGroup.map((job) => job.id) },
      },
    });

    // 모든 isCorrect가 있는 데이터 가져오기
    const corrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ['questionId'], // questionId와 isCorrect를 기준으로 그룹핑
      where: {
        ...where,
        questionId: { in: questions.map((q) => q.id) },
        jobId: { in: jobGroup.map((job) => job.id) },
      },
      _count: { isCorrect: true },
      orderBy: [
        { questionId: 'desc' }, // questionId 기준 정렬
      ],
      take,
      skip,
    });

    // corrects을 기반으로 오답만 가져오기
    let incorrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ['questionId'],
      where: {
        ...where,
        questionId: { in: corrects.map((q) => q.questionId) },
        isCorrect: false,
        jobId: { in: jobGroup.map((job) => job.id) },
      },
      _count: { isCorrect: true },
    });

    // 오답처리 없을 경우 기본값 0으로 데이터생성
    const missingIncorrects = corrects
      .filter(
        (correct) =>
          !incorrects.some(
            (incorrect) => incorrect.questionId === correct.questionId
          )
      )
      .map((correct) => ({
        _count: { isCorrect: 0 }, // 없는 경우 _count.isCorrect를 0으로 설정
        questionId: correct.questionId,
      }));

    // 결과 합치기
    incorrects = [...incorrects, ...missingIncorrects];

    const result = corrects.reduce<any>((acc, item) => {
      const { questionId, _count } = item;
      const incorrect = incorrects.find((ic) => ic.questionId === questionId);
      const question = questions.find((q) => q.id === questionId);

      if (question && incorrect) {
        let questionItem = acc.find((q: any) => q.questionId === questionId);
        if (!questionItem) {
          questionItem = {
            questionId,
            question: question.text,
            product: question.product,
            category: question.category,
            questionType: question.questionType,
            importance: question.importance,
            errorRate: 0,
          };
          //
          acc.push(questionItem);
        }
        //
        questionItem.errorRate =
          (incorrect._count.isCorrect / _count.isCorrect) * 100;
      }

      return acc;
    }, []);

    return NextResponse.json({ result, total: count.length });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}
