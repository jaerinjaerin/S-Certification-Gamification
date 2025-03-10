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
      orderBy: { createdAt: 'asc' },
    });

    return { result: campaigns };
  } catch (error: unknown) {
    console.error('Error get campaigns: ', error);
    return { result: null };
  }
}

export async function getCampaign(id: string | null) {
  try {
    if (!id) {
      return { result: null };
    }
    //
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    return { result: campaign };
  } catch (error: unknown) {
    console.error('Error get campaigns: ', error);
    return { result: null };
  }
}
