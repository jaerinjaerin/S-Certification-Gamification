// Prisma 기반 타입 정의
type Region = Prisma.RegionGetPayload<{
  select: { id: true; name: true };
}>;
type Subsidiary = Prisma.SubsidiaryGetPayload<{
  select: { id: true; name: true; regionId: true };
}>;
type Domain = Prisma.DomainGetPayload<{
  select: { id: true; name: true; subsidiaryId: true };
}>;
type ChannelSegment = Prisma.ChannelSegmentGetPayload<{
  select: { id: true; name: true };
}>;
type JobGroup = Prisma.JobGetPayload<{
  select: { id: true; name: true; group: true };
}>;
type Store = Prisma.StoreGetPayload<{
  select: { id: true; name: true };
}>;

interface FilterData {
  regions: Region[]; // 전체 리스트
  subsidiaries: Subsidiary[]; // 전체 리스트
  domains: Domain[]; // 전체 리스트
  channelSegments: ChannelSegment[]; // 전체 리스트
  jobGroups: JobGroup[]; // 전체 리스트
  salesFormat: Store[]; // 전체 리스트
  selected: {
    region: Region | null; // 선택된 region
    subsidiary: Subsidiary | null; // 선택된 subsidiary
    domain: Domain | null; // 선택된 domain
  };
}
