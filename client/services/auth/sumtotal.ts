import { OAuth2Config, OAuthUserConfig } from "@auth/core/providers";

// userinfo: 'https://samsung.sumtotal.host/apis/documentation?urls.primaryName=apis%2Fv2%2Fswagger#/User/V2Advanced_GetUsers',
export interface Address {
  email1: string;
  email2: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  stateName: string;
  county: string;
  country: string;
  zip: string;
  phone: string;
  phoneExt: string;
  pagerNumber: string;
  fax1: string;
  fax2: string;
  isPrimary: boolean;
  mobile: string;
  emailFormat: boolean;
  emergency: string;
  twitterURL: string;
  linkedInURL: string;
  facebookURL: string;
  googlePlusURL: string;
}

export interface PersonDomain {
  domainId: number;
  userSecurityRoleId: number;
  isPrimary: boolean;
  deleted: number;
  code: string;
  id: string;
}

export interface PersonOrganization {
  organizationId: number;
  isPrimary: boolean;
  joiningDate: string;
  code: string;
  deleted: number;
  mainOrganization: boolean;
}

export interface PersonJob {
  jobTemplateId: number;
  isPrimary: boolean;
  joiningDate: Date;
  code: string;
  deleted: number;
}

export interface PersonRelation {
  manager1Id: string;
  jobTitle: string;
  locationName: string;
  locationCode: string;
}

export interface PersonELM {
  approverId: string;
  defApproverId: string;
  viewAllEmpsInd: boolean;
  reqConfirm: number;
  instructorActive: number;
  level1ApproverId: string;
  level2ApproverId: string;
  level3ApproverId: string;
  level4ApproverId: string;
}

export interface PersonOptional {
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
  text6: string;
  text7: string;
  text8: string;
  text9: string;
  text10: string;
  text11: string;
  text12: string;
  text13: string;
  text14: string;
  text15: string;
  text16: string;
  text17: string;
  text18: string;
  text19: string;
  text20: string;
  date1: Date;
  date2: Date;
  date3: Date;
  date4: Date;
  date5: Date;
  money1: number;
  money2: number;
  money3: number;
  money4: number;
  money5: number;
  integer1: number;
  integer2: number;
  integer3: number;
  integer4: number;
  integer5: number;
  float1: number;
  float2: number;
  float3: number;
  float4: number;
  float5: number;
  ind1: boolean;
  ind2: boolean;
  ind3: boolean;
  ind4: boolean;
  ind5: boolean;
  memo1: string;
  memo2: string;
  memo3: string;
  memo4: string;
  memo5: string;
  decimal1: number;
  decimal2: number;
  decimal3: number;
  decimal4: number;
  decimal5: number;
}

export interface PersonMobileUser {
  isMobileEnabled: boolean;
  mobileUsername: string;
  userPassword: string;
}

export interface UserLogin {
  username: string;
  userPassword: string;
  userEnabled: boolean;
  currentDomainId: number;
  userCulture: string;
  userTypeId: number;
  isLocked: boolean;
  mustChangePassword: boolean;
  passwordExpiryDate: Date;
}

export interface UserLoginProfile {
  loginName: string;
  profileUrl: string;
}

export interface PersonTM {
  maritalCode: string;
  veteranCode: string;
}

export interface SumtotalProfile extends Record<string, any> {
  userId: string;
  personId: number;
  active: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  firstNameNative: string;
  lastNameNative: string;
  friendlyName: string;
  timezoneId: number;
  languageId: number;
  currencyId: number;
  ethnicityCode: string;
  genderCode: string;
  startDate: Date;
  endDate: Date;
  lastReviewDate: Date;
  companyCode: string;
  companyName: string;
  statusCode: number;
  typeCode: number;
  birthDate: Date;
  prefixCode: string;
  prefixText: string;
  suffixCode: string;
  suffixText: string;
  noteText: string;
  imagePath: string;
  govtId: string;
  personDescription: string;
  url: string;
  publishCalendar: boolean;
  internalInd: boolean;
  deleted: boolean;
  welcomeEmailEnabled: boolean;
  homeAddress: Address;
  businessAddress: Address;
  personDomain: PersonDomain[];
  personOrganization: PersonOrganization[];
  personJob: PersonJob[];
  personRelation: PersonRelation;
  personELM: PersonELM;
  personOptional: PersonOptional;
  personMobileUser: PersonMobileUser;
  userLogin: UserLogin;
  userLoginProfile: UserLoginProfile[];
  personTM: PersonTM;
}

// Define the structure for Organization (previously ResultItem)
export interface Organization {
  organizationId: number; // Unique identifier for the organization
  orgDomainInd: boolean; // Indicates domain-related property
  hierarchyId: number; // ID of the hierarchy
  contactUserId: number; // Associated contact user ID
  name: string; // Name of the organization
  orgTypeCode: string | null; // Organization type code
  personCount: number; // Count of people in the organization
  code: string; // Organization code
  contactEmail: string | null; // Contact email
  parentOrganizationName: string; // Parent organization name
  childOrgsCount: number; // Count of child organizations
  pageNum: number; // Page number for pagination
  orgPlaceHolder: boolean; // Placeholder status
  depth: number; // Hierarchical depth
  optionalInfo: {
    text1: string | null;
    text2: string | null;
    text3: string | null;
    text4: string | null;
    text5: string | null;
    text6: string | null;
    text7: string | null;
    text8: string | null;
    text9: string | null;
    text10: string | null;
    text11: string | null;
    text12: string | null;
    text13: string | null;
    text14: string | null;
    text15: string | null;
    date1: string | null;
    date2: string | null;
    integer1: number | null;
    integer2: number | null;
    float1: number | null;
    float2: number | null;
    decimal1: number | null;
    decimal2: number | null;
    ind1: boolean | null;
    ind2: boolean | null;
    money1: number | null;
    money2: number | null;
    memo1: string | null;
    memo2: string | null;
    currencyId: number | null;
  };
  hierarchyName: string; // Name of the hierarchy
  orgContactInfo: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    county: string;
    statename: string;
    zip: string;
    country: string;
    phone1: string;
    phone2: string;
    fax: string;
  } | null; // Contact information of the organization
}

// Define the structure for the input results
export interface OrganizationResult {
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
  data: Organization[];
}

export interface ExtendedOAuth2Config<Profile> extends OAuth2Config<Profile> {
  /**
   * The callback URL for the OAuth provider.
   * This can be used to specify a custom callback URL.
   */
  callbackUrl?: string;
  options?: OAuthUserConfig<Profile>;
}

export default function SumTotal<SumtotalProfile>(
  callbackUrl: string,
  options: OAuthUserConfig<SumtotalProfile>
): ExtendedOAuth2Config<SumtotalProfile> {
  console.log("SumTotal callbackUrl:", callbackUrl);
  return {
    id: "sumtotal",
    name: "SumTotal",
    type: "oauth",
    authorization: {
      url: "https://samsung.sumtotal.host/apisecurity/connect/authorize",
      params: {
        scope: "allapis offline_access",
        prompt: "select_account",
        redirect_uri: process.env.SUMTOTAL_CALLBACK_URL,
      },
    },
    token: "https://samsung.sumtotal.host/apisecurity/connect/token",
    userinfo: "https://samsung.sumtotal.host/apis/api/v2/advanced/users",
    // redirectProxyUrl: process.env.SUMTOTAL_CALLBACK_URL,
    callbackUrl: callbackUrl,
    // callback: process.env.SUMTOTAL_CALLBACK_URL,
    options,
  };
}
// export default function SumTotal<SumtotalProfile>(
//   options: OAuthUserConfig<SumtotalProfile>
// ): OAuthConfig<SumtotalProfile> {
//   return {
//     id: "sumtotal",
//     name: "SumTotal",
//     type: "oauth",
//     authorization: {
//       url: "https://samsung.sumtotal.host/apisecurity/connect/authorize",
//       params: {
//         scope: "allapis",
//       },
//     },
//     token: "https://samsung.sumtotal.host/apisecurity/connect/token",
//     userinfo: "https://samsung.sumtotal.host/apis/api/v2/advanced/users",
//     profile: (profile: SumtotalProfile) => {
//       return {
//         id: profile.userId,
//         name: profile.fullName,
//         email: profile.businessAddress.email1 ?? null,
//         image: profile.imagePath ?? null,
//       };
//     },
//     // options,
//   };
// }

/*
export default function SumTotalProvider<SumtotalProfile>(
  options: OAuthUserConfig<SumtotalProfile>
): OAuthConfig<SumtotalProfile> {
  return {
    id: "sumtotal",
    name: "SumTotal",
    type: "oauth",
    authorization: {
      url: "https://samsung.sumtotal.host/apisecurity/connect/authorize",
      params: {
        scope: "allapis",
      },
    },
    token: "https://samsung.sumtotal.host/apisecurity/connect/token",
    userinfo: "https://samsung.sumtotal.host/apis/api/v2/advanced/users",
    profile: (profile: SumtotalProfile) => {
      console.log("profile:", profile);
      return {
        id: profile.userId,
        name: profile.fullName,
        email: profile.businessAddress.email1 ?? null,
        image: profile.imagePath ?? null,
      };
    },
    options,
  };
}
*/
export function filterResultsByLatestDate(
  results: OrganizationResult[],
  personOrganization: PersonOrganization[]
): Organization[] {
  // Flatten the results array into a single array
  const flatResults = results.flatMap((result) => result.data);

  // Create a map of organizationId to joiningDate from personOrganization
  const orgDateMap = new Map(
    personOrganization.map((org) => [
      org.organizationId,
      new Date(org.joiningDate),
    ])
  );

  // Reduce the flattened results array to keep only the latest entry for each integer1
  const latestResults = Object.values(
    flatResults.reduce<Record<number, Organization>>((acc, org) => {
      const integer1 = org.optionalInfo?.integer1;

      if (integer1 !== null) {
        const currentJoiningDate = orgDateMap.get(org.organizationId);

        // If no entry exists for this integer1, or this entry is more recent, update it
        if (
          !acc[integer1] ||
          (currentJoiningDate &&
            orgDateMap.get(acc[integer1].organizationId) &&
            currentJoiningDate > orgDateMap.get(acc[integer1].organizationId)!)
        ) {
          acc[integer1] = org;
        }
      }

      return acc;
    }, {})
  );

  return latestResults;
}

export type OrganizationDetailsResultData = {
  jobId: string | null;
  storeId: string | null;
  storeSegmentText: string | null;
  channelId: string | null;
  channelSegmentId: string | null;
};

export async function fetchOrganizationDetails(
  accessToken: string,
  profile: { personOrganization: any[] }
): Promise<OrganizationDetailsResultData> {
  let jobId: string | null = null;
  let storeId: string | null = null;
  let storeSegmentText: string | null = null;
  let channelId: string | null = null;
  let channelSegmentId: string | null = null;

  if (!accessToken) {
    console.error("Access token is required");
    return { jobId, storeId, storeSegmentText, channelId, channelSegmentId };
  }

  const orgIds: string[] = profile.personOrganization
    .filter((org) => org.deleted !== 1)
    .map((org) => org.organizationId.toString());

  const fetchOrganizationData = async (orgId: string): Promise<any> => {
    try {
      const response = await fetch(
        `https://samsung.sumtotal.host/apis/api/v1/organizations/search?organizationId=${orgId}`,
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data for orgId ${orgId}:`, error);
      return null;
    }
  };

  const fetchOrganizationDataByParentName = async (
    parentName: string
  ): Promise<any> => {
    try {
      const encodedParentName = encodeURIComponent(parentName);
      const response = await fetch(
        `https://samsung.sumtotal.host/apis/api/v1/organizations/search?orgName=${encodedParentName}`,
        {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data for parentName ${parentName}:`, error);
      return null;
    }
  };

  try {
    // Fetch organization data
    const results = await Promise.all(orgIds.map(fetchOrganizationData));
    const filteredResults = filterResultsByLatestDate(
      results,
      profile.personOrganization
    );

    let parentOrganizationNames: string | null = null;

    // Process filtered results
    filteredResults.forEach((organization: any) => {
      if (!organization) return;

      const { text9, text11, integer1 } = organization.optionalInfo;

      if (!text9 || !integer1) return;

      if (integer1 === 7) {
        jobId = text9;
      }

      if (integer1 === 5) {
        storeId = text9;
        storeSegmentText = text11;
        parentOrganizationNames = organization.parentOrganizationName;
      }
    });

    // Fetch parent organization details if needed
    if (parentOrganizationNames) {
      const parentData = await fetchOrganizationDataByParentName(
        parentOrganizationNames
      );

      if (parentData && parentData.data.length > 0) {
        const { text7, text8, integer1 } = parentData.data[0]?.optionalInfo;

        if (integer1 === 4) {
          channelId = text7;
          channelSegmentId = text8;
        }
      }
    }
  } catch (error) {
    console.error("Error processing organization details:", error);
  }

  // Return the collected information
  return { jobId, storeId, storeSegmentText, channelId, channelSegmentId };
}
