/* eslint-disable @typescript-eslint/no-explicit-any */

// userinfo: 'https://samsung.sumtotal.host/apis/documentation?urls.primaryName=apis%2Fv2%2Fswagger#/User/V2Advanced_GetUsers',
interface Address {
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

interface PersonDomain {
  domainId: number;
  userSecurityRoleId: number;
  isPrimary: boolean;
  deleted: number;
  code: string;
  id: string;
}

interface PersonOrganization {
  organizationId: number;
  isPrimary: boolean;
  joiningDate: Date;
  code: string;
  deleted: number;
  mainOrganization: boolean;
}

interface PersonJob {
  jobTemplateId: number;
  isPrimary: boolean;
  joiningDate: Date;
  code: string;
  deleted: number;
}

interface PersonRelation {
  manager1Id: string;
  jobTitle: string;
  locationName: string;
  locationCode: string;
}

interface PersonELM {
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

interface PersonOptional {
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

interface PersonMobileUser {
  isMobileEnabled: boolean;
  mobileUsername: string;
  userPassword: string;
}

interface UserLogin {
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

interface UserLoginProfile {
  loginName: string;
  profileUrl: string;
}

interface PersonTM {
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

// export default function SumTotalProvider<p extends SumtotalProfile>(
//   options: OAuthUserConfig<P>
// ): OAuthConfig<P> {
//   return {
//     id: 'sumtotal',
//     name: 'SumTotal',
//     type: 'oauth',
//     authorization: {
//       url: 'https://samsung.sumtotal.host/apisecurity/connect/authorize',
//       params: {
//         scope: 'allapis',
//       },
//     },
//     token: 'https://samsung.sumtotal.host/apisecurity/connect/token',
//     userinfo: 'https://samsung.sumtotal.host/apis/api/v2/advanced/users',
//     authorization: { params: { scope: 'openid email profile' } },
//     idToken: true,
//     checks: ['pkce', 'state'],
//     profile: (profile: SumtotalProfile) => {
//       console.log('profile:', profile);
//       return {
//         id: profile.userId,
//         name: profile.fullName,
//         email: profile.businessAddress.email1 ?? null,
//         image: profile.imagePath ?? null,
//       };
//     },
//     options,
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
