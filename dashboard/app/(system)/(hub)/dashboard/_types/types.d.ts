type JsonValue = string | number | boolean | Date | JsonObject;

interface JsonObject {
  [key: string]: JsonValue | JsonValue[];
}

interface QueryParams {
  [key: string]: any;
}

interface ParsedDateRange {
  from: Date;
  to: Date;
}

// Prisma 기반 타입 정의
type Campaign = Prisma.CampaignGetPayload;
type Region = Prisma.RegionGetPayload;
type Subsidiary = Prisma.SubsidiaryGetPayload;
type Domain = Prisma.DomainGetPayload;
type ChannelSegment = Prisma.ChannelSegmentGetPayload;
type JobGroup = Prisma.JobGetPayload;
type Store = Prisma.StoreGetPayload;

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

type UserListProps = {
  providerUserId: string;
  lastCompletedStage: number | string;
};
