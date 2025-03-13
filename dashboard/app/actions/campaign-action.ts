'use server';
import { setHoursFromZeroToEnd } from '@/lib/time';
import { prisma } from '@/model/prisma';
import { Prisma } from '@prisma/client';

export async function getCampaigns(role: string) {
  try {
    let where = {} as Prisma.CampaignWhereInput;
    if (role !== 'ADMIN') {
      const roles = await prisma.role.findUnique({
        where: { name: role },
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
        deleted: false,
      };
    }

    const result = await prisma.campaign.findMany({
      where,
      select: {
        id: true,
        name: true,
        createdAt: true,
        startedAt: true,
        endedAt: true,
        deleted: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return { result };
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
      include: { settings: true },
    });

    let result = null;
    if (campaign) {
      result = {
        ...campaign,
        ...setHoursFromZeroToEnd(campaign.startedAt, campaign.endedAt),
      };
    }

    return { result };
  } catch (error: unknown) {
    console.error('Error get campaigns: ', error);
    return { result: null };
  }
}
