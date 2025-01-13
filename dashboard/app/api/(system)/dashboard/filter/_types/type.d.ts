// Prisma 기반 타입 정의
type Campaign = Prisma.CampaignGetPayload<{
  select: { id: true; name: true };
}>;
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
  regions: Region[];
  subsidiary: Subsidiary[];
  domain: Domain[];
  channelSegment: ChannelSegment[];
  jobGroup: JobGroup[];
  salesFormat: Store[];
}

interface UserType {
  name: string;
  id: string;
}

interface UserGroup {
  all: UserType;
  plus: UserType;
  none: UserType;
}

interface AllFilterData {
  campaign: Campaign[];
  userGroup: UserGroup;
  filters: FilterData;
}
