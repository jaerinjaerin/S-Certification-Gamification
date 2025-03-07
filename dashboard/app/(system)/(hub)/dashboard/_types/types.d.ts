type JsonValue = string | number | boolean | Date | JsonObject;

interface JsonObject {
  [key: string]: JsonValue | JsonValue[];
}

interface QueryParams {
  [key: string]: string | undefined;
}

interface ParsedDateRange {
  from: Date;
  to: Date;
}

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
  select: { id: true; name: true };
}>;
type Store = Prisma.StoreGetPayload<{
  select: { id: true; name: true };
}>;

interface FilterData {
  region: Region[];
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
  userGroup: UserGroup;
  filters: FilterData;
}

type GroupedData = {
  group: string;
  items: {
    title: string;
    value: number;
  }[];
};

type ImprovedDataStructure = GroupedData[];
