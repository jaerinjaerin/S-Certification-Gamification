/* eslint-disable @typescript-eslint/no-explicit-any */

import { buildWhereWithValidKeys } from '@/lib/where';
import { prisma } from '@/model/prisma';

// userId 확인 후 중복 제거, quizStageIndex값이 높으면 업데이트
export function removeDuplicateUsers(users: Record<string, any>[]) {
  return Object.values(
    users.reduce(
      (acc, user: any) => {
        if (
          !acc[user.userId] ||
          acc[user.userId].quizStageIndex < user.quizStageIndex
        ) {
          acc[user.userId] = user;
        }
        return acc;
      },
      {} as Record<string, any>[]
    )
  );
}

// region와 subsidiary가 null인 테이블이 있어서 domainId만 확인하기 위한 함수
export const domainCheckOnly = async (where: any) => {
  let nwhere = buildWhereWithValidKeys(where, [
    'campaignId',
    'domainId',
    'createdAt',
  ]);

  if (!where.domainId && (where.regionId || where.subsidiaryId)) {
    if (where.subsidiaryId) {
      const subsidiary = await prisma.subsidiary.findUnique({
        where: { id: where.subsidiaryId },
        select: { domains: true },
      });

      if (subsidiary?.domains) {
        nwhere = {
          ...nwhere,
          domainId: {
            in: subsidiary.domains.map((domain) => domain.id),
          },
        };
      } else {
        nwhere = { ...nwhere, domainId: { in: [] } };
      }
    } else {
      const region = await prisma.region.findUnique({
        where: { id: where.regionId },
        select: { subsidiaries: true },
      });

      if (region?.subsidiaries) {
        const subsidiaries = await prisma.subsidiary.findMany({
          where: {
            id: {
              in: region.subsidiaries.map((subsidiary) => subsidiary.id),
            },
          },
          select: { domains: true },
        });
        //
        const domains = subsidiaries.flatMap(
          (subsidiary) => subsidiary.domains
        );
        nwhere = {
          ...nwhere,
          domainId: { in: domains.map((domain) => domain.id) },
        };
      } else {
        nwhere = { ...nwhere, domainId: { in: [] } };
      }
    }
  }

  return nwhere;
};

// Experts by group initial data
export const initialExpertsData: ImprovedDataStructure = [
  {
    group: 'plus',
    items: [
      { title: 'ff', value: 0 },
      { title: 'fsm', value: 0 },
    ],
  },
  {
    group: 'ses',
    items: [
      { title: 'ff', value: 0 },
      { title: 'fsm', value: 0 },
    ],
  },
];
