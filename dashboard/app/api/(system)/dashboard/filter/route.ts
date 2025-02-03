import { prisma } from '@/model/prisma';
import { NextResponse } from 'next/server';

async function fetchDependentFilters() {
  // Step 1: Fetch all regions
  const regions = await prisma.region.findMany();

  // Step 2: Fetch all subsidiaries
  const subsidiaries = await prisma.subsidiary.findMany();

  // Step 3: Fetch all domains
  const domains = await prisma.domain.findMany();

  // Step 4: Map dependencies
  const regionWithDependencies = regions.map((region) => {
    // Find subsidiaries and domains related to this region
    const relatedSubsidiaries = subsidiaries.filter(
      (subsidiary) => subsidiary.regionId === region.id
    );

    const relatedDomains = relatedSubsidiaries.flatMap((subsidiary) =>
      domains.filter((domain) => domain.subsidiaryId === subsidiary.id)
    );

    return {
      ...region,
      subsidiaries: relatedSubsidiaries,
      domains: relatedDomains,
    };
  });

  const subsidiaryWithDependencies = subsidiaries.map((subsidiary) => {
    // Find related region and domains
    const relatedRegion = regions.find(
      (region) => region.id === subsidiary.regionId
    );
    const relatedDomains = domains.filter(
      (domain) => domain.subsidiaryId === subsidiary.id
    );

    return {
      ...subsidiary,
      region: relatedRegion,
      domains: relatedDomains,
    };
  });

  const domainWithDependencies = domains.map((domain) => {
    // Find related subsidiary and region
    const relatedSubsidiary = subsidiaries.find(
      (subsidiary) => subsidiary.id === domain.subsidiaryId
    );
    const relatedRegion = relatedSubsidiary
      ? regions.find((region) => region.id === relatedSubsidiary.regionId)
      : null;

    return {
      ...domain,
      subsidiary: relatedSubsidiary,
      region: relatedRegion,
    };
  });

  return {
    region: regionWithDependencies,
    subsidiary: subsidiaryWithDependencies,
    domain: domainWithDependencies,
  };
}

export async function GET() {
  try {
    await prisma.$connect();

    // const { searchParams } = request.nextUrl;

    const data: AllFilterData = {
      campaign: [],
      userGroup: {
        all: {
          name: 'All',
          id: 'all',
        },
        plus: { name: 'S+ User', id: 'plus' },
        none: {
          name: 'Non S+ User',
          id: 'none',
        },
      },
      filters: {
        region: [],
        subsidiary: [],
        domain: [],
        channelSegment: [],
        salesFormat: [],
        jobGroup: [],
      },
    };

    data.campaign = await prisma.campaign.findMany();
    // Fetch regions (always fetch all regions)
    const regions = await fetchDependentFilters();
    data.filters = { ...data.filters, ...regions };
    // Fetch other data
    data.filters.channelSegment = await prisma.channelSegment.findMany({});
    data.filters.salesFormat = await prisma.store.findMany({});

    // 잡그룹 정렬 (데이터 그대로 사용하지 않음)
    const jobGroupData = await prisma.job.findMany({});
    data.filters.jobGroup = jobGroupData.reduce(
      (acc, job) => {
        if (acc.findIndex((g) => g.name === job.group) === -1) {
          acc.push({ id: job.group, name: job.group });
        }

        return acc;
      },
      [] as { id: string; name: string }[]
    );

    return NextResponse.json(data, { status: 200 });
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
