/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthType } from "@prisma/client";

export const buildWhereCondition = (
  params: QueryParams,
  period: ParsedDateRange
): Record<string, any> => {
  let where: Record<string, any> = {
    campaignId: params.campaign,
    createdAt: {
      gte: period.from, // from date
      lte: period.to, // to date
    },
  };

  if (params.userGroup === "plus") {
    where = { ...where, authType: AuthType.SUMTOTAL };
  } else if (params.userGroup === "none") {
    where = {
      ...where,
      authType: {
        in: [AuthType.GUEST, AuthType.UNKNOWN],
      },
    };
  }

  if (params.region && params.region !== "all") {
    where = { ...where, regionId: params.region };
  }

  if (params.subsidiary && params.subsidiary !== "all") {
    where = { ...where, subsidiaryId: params.subsidiary };
  }

  if (params.domain && params.domain !== "all") {
    where = { ...where, domainId: params.domain };
  }

  if (params.channelSegment && params.channelSegment !== "all") {
    where = { ...where, channelSegmentId: params.channelSegment };
  }

  if (params.salesFormat && params.salesFormat !== "all") {
    where = { ...where, storeId: params.salesFormat };
  }

  if (params.jobGroup && params.jobGroup !== "all") {
    where = { ...where, jobId: params.jobGroup };
  }

  return where;
};

export const buildWhereWithValidKeys = (
  where: Record<string, any>,
  keys: string[]
) => {
  return keys.reduce((acc, key) => {
    if (where?.[key] !== undefined) {
      acc[key] = where[key];
    }
    return acc;
  }, {} as Record<string, any>);
};
