import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

async function fetchRegions() {
  return prisma.region.findMany({});
}

async function fetchSubsidiaryById(subsidiaryId: string) {
  return prisma.subsidiary.findUnique({
    where: { id: subsidiaryId },
  });
}

async function fetchDomainsBySubsidiaryId(subsidiaryId: string) {
  return prisma.domain.findMany({
    where: { subsidiaryId },
  });
}

async function fetchRegionById(regionId: string) {
  return prisma.region.findUnique({
    where: { id: regionId },
  });
}

async function fetchSubsidiariesByRegionId(regionId: string) {
  return prisma.subsidiary.findMany({
    where: { regionId },
  });
}

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();

    const { searchParams } = request.nextUrl;
    const dependencies = Object.fromEntries(
      [...searchParams.entries()]
        .filter(([key]) => key.startsWith("dependencies."))
        .map(([key, value]) => [key.replace("dependencies.", ""), value])
    );

    const data: FilterData = {
      regions: [],
      subsidiaries: [],
      domains: [],
      channelSegments: [],
      jobGroups: [],
      salesFormat: [],
      selected: {
        region: null,
        subsidiary: null,
        domain: null,
      },
    };

    // Fetch regions (always fetch all regions)
    data.regions = await fetchRegions();

    if (dependencies.domainId) {
      const domain = await prisma.domain.findUnique({
        where: { id: dependencies.domainId },
        select: { id: true, name: true, subsidiaryId: true },
      });

      if (domain) {
        data.selected.domain = domain;

        if (domain.subsidiaryId) {
          const subsidiary = await fetchSubsidiaryById(domain.subsidiaryId);

          if (subsidiary) {
            data.selected.subsidiary = subsidiary;
            data.domains = await fetchDomainsBySubsidiaryId(subsidiary.id);

            if (subsidiary.regionId) {
              data.selected.region = await fetchRegionById(subsidiary.regionId);
              data.subsidiaries = await fetchSubsidiariesByRegionId(
                subsidiary.regionId
              );
            }
          }
        }
      }
    } else if (dependencies.subsidiaryId) {
      const subsidiary = await fetchSubsidiaryById(dependencies.subsidiaryId);

      if (subsidiary) {
        data.selected.subsidiary = subsidiary;
        data.domains = await fetchDomainsBySubsidiaryId(subsidiary.id);

        if (subsidiary.regionId) {
          data.selected.region = await fetchRegionById(subsidiary.regionId);
          data.subsidiaries = await fetchSubsidiariesByRegionId(
            subsidiary.regionId
          );
        }
      }
    } else if (dependencies.regionId) {
      data.subsidiaries = await fetchSubsidiariesByRegionId(
        dependencies.regionId
      );

      const subsidiaryIds = data.subsidiaries.map((subsidiary) =>
        String(subsidiary.id)
      );
      data.domains = await prisma.domain.findMany({
        where: { subsidiaryId: { in: subsidiaryIds } },
      });

      data.selected.region = await fetchRegionById(dependencies.regionId);
    }

    // Fetch other data
    data.channelSegments = await prisma.channelSegment.findMany({
      select: { id: true, name: true },
    });
    data.jobGroups = await prisma.job.findMany({
      select: { id: true, name: true, group: true },
    });
    data.salesFormat = await prisma.store.findMany({
      select: { id: true, name: true },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}
