'use server';

import { prisma } from '@/model/prisma';
import { Prisma } from '@prisma/client';

export async function getCampaigns(role: string) {
  try {
    let where = {} as Prisma.CampaignWhereInput;
    if (role !== 'ADMIN') {
      const roles = await prisma.role.findUnique({
        where: { id: role },
        include: {
          permissions: {
            select: { permission: { select: { domains: true } } },
          },
        },
      });

      let domainIds: string[] = [];
      if (roles) {
        domainIds = roles.permissions.flatMap((p) =>
          p.permission.domains.map((d) => d.id)
        );
      }

      where = {
        quizSets: { some: { domain: { id: { in: domainIds } } } },
      };
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: { settings: true },
    });

    return { result: campaigns };
  } catch (error: unknown) {
    console.error('Error get campaigns: ', error);
    return { result: null };
  }
}
