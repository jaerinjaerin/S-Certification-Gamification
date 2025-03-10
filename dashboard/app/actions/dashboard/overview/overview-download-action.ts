'use server';
import { prisma } from '@/model/prisma';
import { createOverviewExcelBlob, OverviewExcelDataProps } from '@/lib/excel';
import { getJobIds, removeDuplicateUsers } from '@/lib/data';
import { AuthType } from '@prisma/client';
import { formatDate } from 'date-fns';
import { paramsToQueries } from '@/lib/query';

export async function downloadOverview(data: Record<string, any>) {
  try {
    const { where: condition, period } = paramsToQueries(data);
    const { jobId, storeId, ...where } = condition;

    const settings = await prisma.campaignSettings.findFirst({
      where: { campaignId: where.campaignId },
    });

    if (!settings) {
      throw new Error('Campaign settings not found');
    }

    const jobGroup = await getJobIds(jobId);
    const jobFF = jobGroup.ff;
    const jobFSM = jobGroup.fsm;

    const jobGroups = [
      {
        key: 'ff',
        stageIndex: settings.ffFirstBadgeStageIndex! || -1,
        jobIds: jobFF,
      },
      {
        key: 'fsm',
        stageIndex: settings.fsmFirstBadgeStageIndex! || -1,
        jobIds: jobFSM,
      },
    ];

    let regions = await prisma.region.findMany({
      include: { subsidiaries: { include: { domains: true } } },
      orderBy: { order: 'asc' },
    });

    const domainsWithSubsidiaryNull = await prisma.domain.findMany({
      where: { subsidiaryId: null },
      orderBy: { order: 'asc' },
    });

    const domainsIntoRegion = domainsWithSubsidiaryNull.map((domain) =>
      transformDataToRegion(domain)
    );

    regions = [...domainsIntoRegion, ...regions] as typeof regions;

    const goals = await prisma.domainGoal.findMany({});
    const userBadges = await Promise.all(
      jobGroups.map(({ stageIndex }) =>
        prisma.userQuizBadgeStageStatistics.findMany({
          where: {
            quizStageIndex: stageIndex,
            ...(where?.campaignId ? { campaignId: where.campaignId } : {}),
            ...(where?.createdAt ? { createdAt: where.createdAt } : {}),
          },
        })
      )
    );

    // 유저 중복 제거
    const badges = removeDuplicateUsers(userBadges.flat());

    // 데이터 생성 시작
    let expertUsers: OverviewExcelDataProps[] = [];
    // 지역 반복
    regions.forEach((region) => {
      const subsidiaries: OverviewExcelDataProps[] = [];

      // 자회사 반복
      region.subsidiaries.forEach((subsidiary) => {
        if (subsidiary.domains.length > 0) {
          const domains: OverviewExcelDataProps[] = [];

          // 도메인 반복
          subsidiary.domains.forEach((domain) => {
            // 목표값 계산
            const { ff, fsm, ffSes, fsmSes } = goals.find(
              (goal) => goal.domainId === domain.id
            ) || {
              ff: 0,
              fsm: 0,
              ffSes: 0,
              fsmSes: 0,
            };
            const target = ff + fsm + ffSes + fsmSes;

            // 도메인 진행 상황
            const badgesInDomain = badges.filter(
              (badge) => badge.domainId === domain.id
            );
            const progress = badgesInDomain.length;
            const percentage = target > 0 ? progress / target : 0;

            const sPlus = badgesInDomain.filter(
              (badge) => badge.authType === AuthType.SUMTOTAL
            ).length;
            const nonSPlus = badgesInDomain.filter(
              (badge) => badge.authType !== AuthType.SUMTOTAL
            ).length;
            const ses = badgesInDomain.filter(
              (badge) =>
                badge.storeId === '4' &&
                badge.jobId &&
                jobFSM.includes(badge.jobId)
            ).length;
            const cnr = badgesInDomain.filter(
              (badge) =>
                (badge.storeId !== '4' || badge.storeId === null) &&
                badge.jobId &&
                jobFSM.includes(badge.jobId)
            ).length;
            const sesFieldForce = badgesInDomain.filter(
              (badge) =>
                badge.storeId === '4' &&
                badge.jobId &&
                jobFF.includes(badge.jobId)
            ).length;
            const nonSesFieldForce = badgesInDomain.filter(
              (badge) =>
                (badge.storeId !== '4' || badge.storeId === null) &&
                badge.jobId &&
                jobFF.includes(badge.jobId)
            ).length;

            // 도메인 데이터 생성
            const data = {
              region: region.name,
              subsidiary: subsidiary.name,
              country: domain.name,
              target,
              progress,
              percentage,
              sPlus,
              nonSPlus,
              numFSMs: ses + cnr,
              ses,
              cnr,
              numFieldForce: sesFieldForce + nonSesFieldForce,
              sesFieldForce,
              nonSesFieldForce,
            } as OverviewExcelDataProps;
            domains.push(data);
          });

          // 자회사 합계 생성
          const totalDomains = calculateTotals(
            domains,
            region.name,
            subsidiary.name
          );
          subsidiaries.push(totalDomains);
          expertUsers = [...expertUsers, totalDomains, ...domains];
        }
      });

      // 지역 합계 생성 및 삽입
      const totalSubsidiaries = calculateTotals(
        subsidiaries,
        `${region.name} TTL`,
        null
      );

      const foundRegionItemIndex = expertUsers.findIndex(
        (expert) => expert.region === region.name
      );
      expertUsers.splice(foundRegionItemIndex, 0, totalSubsidiaries);
    });

    const regionTtls = expertUsers.filter((expert) =>
      expert.region.includes('TTL')
    );
    const totalRegions = calculateTotals(regionTtls, 'Global', null);
    expertUsers.unshift(totalRegions);
    // 데이터 생성 끝
    //

    const blob = await createOverviewExcelBlob(expertUsers);
    const arrayBuffer = await blob.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');
    const filename = `certification_status_${where?.campaignId || 'all'}_${formatDate(period.from, 'yyyy-MM-dd')}_to_${formatDate(period.to, 'yyyy-MM-dd')}.xlsx`;

    return {
      base64: base64String,
      filename,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { error: 'File generation failed' };
  }
}

// 퍼센티지 계산 함수
const calculatePercentage = (progress: number, target: number) => {
  return target > 0 ? progress / target : 0;
};

// 총합 계산 함수
const calculateTotals = (
  items: OverviewExcelDataProps[],
  region: string,
  subsidiary: string | null
): OverviewExcelDataProps => {
  const totals = items.reduce(
    (acc, item) => {
      acc.target += item.target;
      acc.progress += item.progress;
      acc.sPlus += item.sPlus;
      acc.nonSPlus += item.nonSPlus;
      acc.numFSMs += item.numFSMs;
      acc.ses += item.ses;
      acc.cnr += item.cnr;
      acc.numFieldForce += item.numFieldForce;
      acc.sesFieldForce += item.sesFieldForce;
      acc.nonSesFieldForce += item.nonSesFieldForce;
      return acc;
    },
    {
      region,
      subsidiary,
      country: null,
      target: 0,
      progress: 0,
      percentage: 0,
      sPlus: 0,
      nonSPlus: 0,
      numFSMs: 0,
      ses: 0,
      cnr: 0,
      numFieldForce: 0,
      sesFieldForce: 0,
      nonSesFieldForce: 0,
    } as OverviewExcelDataProps
  );
  totals.percentage = calculatePercentage(totals.progress, totals.target);
  return totals;
};

// Region 구조로 데이터 변경(Region, Subsidiary 값이 null 경우 사용)
function transformDataToRegion(input: Record<string, any>) {
  return {
    id: input.id,
    name: input.name,
    code: input.code,
    order: input.order,
    hqId: input.id,
    subsidiaries: [
      {
        id: input.id,
        name: input.name,
        code: input.code,
        order: input.order,
        regionId: input.id,
        domains: [
          {
            id: input.id,
            name: input.name,
            code: input.code,
            subsidiaryId: input.id,
            order: input.order,
            createdAt: input.createdAt,
            updatedAt: input.updatedAt,
          },
        ],
      },
    ],
  };
}
