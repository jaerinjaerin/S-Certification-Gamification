import { prisma } from "@/prisma-client";
import type { Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthType, User } from "@prisma/client";
import NextAuth, { DefaultSession, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  fetchOrganizationDetails,
  SumtotalProfile,
} from "./services/auth/sumtotal";
import { encrypt } from "./utils/encrypt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider: string;
      authType: AuthType;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    {
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
      clientId: process.env.SUMTOTAL_CLIENT_ID,
      clientSecret: process.env.SUMTOTAL_CLIENT_SECRET,
      profile: async (profile: SumtotalProfile, tokens) => {
        console.log("profile:", profile);
        // // console.log("accessToken:", tokens.access_token);
        // 이 값이 User 모델에 저장됨. 여기에 전달되는 값은 User 스키마에 정의된 필드만 사용 가능

        const accessToken = tokens.access_token;
        // job 및 store 추출

        let jobId: string | null = null;
        let storeId: string | null = null;
        let storeSegmentText: string | null = null;
        let channelId: string | null = null;
        let channelSegmentId: string | null = null;
        let channelName: string | null = null;

        if (accessToken) {
          const result = await fetchOrganizationDetails(accessToken, profile);
          if (result) {
            jobId = result.jobId;
            storeId = result.storeId;
            storeSegmentText = result.storeSegmentText;
            channelId = result.channelId;
            channelSegmentId = result.channelSegmentId;
            channelName = result.channelName;
          }
        }

        // 확인 regionId, subsidiaryId
        let regionId: string | null = null;
        let subsidiaryId: string | null = null;
        const domainCode = profile.personDomain?.find(
          (domain) => domain.isPrimary
        )?.code;
        if (domainCode) {
          const domain = await prisma.domain.findFirst({
            where: {
              code: domainCode,
            },
            include: {
              subsidiary: {
                include: {
                  region: true,
                },
              },
            },
          });

          if (domain) {
            regionId = domain.subsidiary?.regionId || null;
            subsidiaryId = domain.subsidiaryId;
          }
        }

        // console.log("jobId:", jobId);
        // console.log("storeId:", storeId);
        // console.log("storeSegmentText:", storeSegmentText);
        // console.log("channelId:", channelId);
        // console.log("regionId:", regionId);
        // console.log("subsidiaryId:", subsidiaryId);

        return {
          id: encrypt(profile.userId, true),
          emailId:
            profile.businessAddress.email1 != null
              ? encrypt(profile.businessAddress.email1, true)
              : null,
          name:
            process.env.NODE_ENV !== "production"
              ? profile.businessAddress.email1
              : null,
          image: profile.imagePath ?? null,
          authType: AuthType.SUMTOTAL,
          providerUserId: profile.userId ? encrypt(profile.userId, true) : null,
          providerPersonId: profile.personId
            ? encrypt(profile.personId.toString(), true)
            : null,
          domainId:
            profile.personDomain
              ?.find((domain) => domain.isPrimary)
              ?.domainId?.toString() || null,
          domainCode:
            profile.personDomain?.find((domain) => domain.isPrimary)?.code ||
            null,
          jobId: jobId,
          storeId: storeId,
          storeSegmentText: storeSegmentText,
          channelId: channelId,
          channelSegmentId: channelSegmentId,
          regionId: regionId,
          subsidiaryId: subsidiaryId,
          channelName: channelName,
        };
      },
    },
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        const { email, code } = credentials;
        const encryptedEmail = encrypt(email as string, true);

        let user = await prisma.user.findFirst({
          where: { emailId: encryptedEmail },
        });

        // 사용자 계정이 없으면 생성
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: "Guest User",
              emailId: encryptedEmail,
              authType: AuthType.GUEST,
            },
          });
        }

        // console.log("authorize user", user);

        return user;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, //365일
  },
  callbacks: {
    jwt: async ({ token, profile, user, account }) => {
      // console.log("auth callbacks jwt", token, profile, user, account);
      /*
       {
        id: 'cd6ac648-b5d5-4e0b-9073-249bb5fbd813',
        name: 'tina.lee@cheilpengtai.com',
        email: null,
        emailVerified: null,
        image: null,
        createdAt: 2025-02-03T09:30:13.746Z,
        updatedAt: 2025-02-03T09:30:13.746Z,
        emailId: 'eHfxfMMP4X5hpzfSCNgRgV6vuqty7cxapIZBoVl5mgE=',
        authType: 'SUMTOTAL',
        providerUserId: 'tIRw7YwCdAvn6R+Ha45xdA==',
        providerPersonId: 'F2i8ia++APY1d8lDVNh/aw==',
        jobId: '4',
        domainId: '29',
        domainCode: 'OrgCode-7',
        languageId: null,
        regionId: null,
        subsidiaryId: null,
        storeId: '4',
        storeSegmentText: '',
        channelId: '2',
        channelSegmentId: '2',
        channelName: '4'
      } {
        access_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkEwQjVCMUFCMTUzMjI1MzRDNUIxQUU3QTdEMjZDRkI3NDYzNTIwMzNSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6Im9MV3hxeFV5SlRURnNhNTZmU2JQdDBZMUlETSJ9.eyJuYmYiOjE3Mzg1NzcwMjEsImV4cCI6MTczODU4NDIyMSwiaXNzIjoiaHR0cHM6Ly9zYW1zdW5nLnN1bXRvdGFsLmhvc3QvYXBpc2VjdXJpdHkiLCJhdWQiOlsiZXh0YXBpcyIsImh0dHBzOi8vc2Ftc3VuZy5zdW10b3RhbC5ob3N0L2FwaXNlY3VyaXR5L3Jlc291cmNlcyJdLCJjbGllbnRfaWQiOiJTQU1TVU5HRUxFQ1RST05JQ1NfUFJPRF9hZGVlMjBmZGZkNDM0ZTlmYjU1YmE2NmQ4OTFiYWQ3OCIsInN1YiI6ImhxX2FwaS50ZXN0MSIsImF1dGhfdGltZSI6MTczODU3NzAyMCwiaWRwIjoibG9jYWwiLCJuYW1lIjoiaHFfYXBpLnRlc3QxIiwidXNlcm5hbWUiOiJocV9hcGkudGVzdDEiLCJtYXNrZWR1c2VyaWQiOiIyM0UzOEI2NEU0NjgwRTBBQkZBM0JDQjBGNjg3NURCNiIsInJvbGUiOiJQb3J0YWwgVXNlciIsInRlbmFudCI6IlNBTVNVTkdFTEVDVFJPTklDU19QUk9EIiwiYnJva2Vyc2Vzc2lvbiI6IjAzZWFiNjk0NGUwYTQzZGU5ZTFiMTg3MDEwNGI5ZjI1IiwiY3VsdHVyZSI6ImVuLVVTIiwibGFuZ3VhZ2UiOiJlbi11cyIsImRhdGVmb3JtYXQiOiJNTS9kZC95eXl5IiwidGltZWZvcm1hdCI6ImhoOm1tIGEiLCJ1c2VyaWQiOiIyMTM1MTU2IiwicGVyc29ucGsiOiIxNDg0MjAzIiwiZ3Vlc3RhY2NvdW50IjoiMCIsInVzZXJ0aW1lem9uZWlkIjoiQXNpYS9TZW91bCIsInR3b0xldHRlcklTT0xhbmd1YWdlTmFtZSI6ImVuIiwiaXNydGwiOiJGYWxzZSIsInBlcnNvbmd1aWQiOiI0ZjM3YjM0Mi0wZjYyLTQxMzItOTM1MS0wMGYzN2NhNTMzM2EiLCJ1c2VyaWRoYXNoIjoiMTg5Nzk0NDQyMyIsIndmbXVzZXIiOiJUcnVlIiwicHJvcGVybmFtZSI6IlRlc3QrVGVzdCIsImp0aSI6IkU5NEM4MzU1NjU5NUEyRTFCQUNDRjI0NUVDN0JGMzhDIiwiaWF0IjoxNzM4NTc3MDIxLCJzY29wZSI6WyJhbGxhcGlzIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.Qm3kck46-MxC2mMeZzVgUZVd2hdePq7t2dnnDcISe4gB9vEog5bJ6c_Eck0C_W7DzDb0kMZdt6HWAj98pvFZxayRIHQqa3ZHpBab07SXEIKUwrzI_1tk6Z5Um4ZQGaDj4h2HqFzmQZkzEf4y2gE0qhUClQ2JV8ReMiWMgIaOMENwc3AWz69McTsQGqDxt64UwORks5U44YTuopxPz8ePf6ucGJss4482lTT5nDaH4WuK7xiWWvzlWf-EbGUxzWCeaMfIldtT-jd3YKCQGdCYtP_rUkJf-lkyx1yA6mrVHpCpX1mwMsLH9B2yvcL05QxjgcoNk0M5CvfdD00zpa57Jw',
        expires_in: 7200,
        token_type: 'bearer',
        refresh_token: '595745B523E6A7B73888900B39891AEF4E43B390E28E89AADF48346EA17077A9',
        scope: 'allapis offline_access',
        expires_at: 1738584221,
        provider: 'sumtotal',
        type: 'oauth',
        providerAccountId: 'tIRw7YwCdAvn6R+Ha45xdA=='
      }
      */
      if (account) {
        token.provider = account.provider;
      }
      if (user) {
        token.authType = (user as User).authType;
      }
      return token;
    },
    session: async (params): Promise<Session | DefaultSession> => {
      const { session } = params;
      // // console.log("auth callbacks session", session);

      // JWT 전략일 경우 token을 사용
      if ("token" in params) {
        const { token } = params;

        if (session.user && token.sub) {
          session.user.id = token.sub;
          session.user.provider = (token as any).provider;
          session.user.authType = (token as any).authType;
        }
      }

      // Database 전략일 경우 추가 로직이 필요하면 여기서 처리
      if ("user" in params) {
        const { user } = params;

        if (session.user) {
          session.user.id = user.id;
        }
      }

      return session;
    },
    authorized: ({ auth }) => {
      // console.log("next-auth authorized", auth);
      return !!auth?.user; // this ensures there is a logged in user for -every- request
    },
    // redirect: async ({ url, baseUrl }) => {
    //   // console.log("next-auth redirect", url, baseUrl);
    //   const result = url.startsWith(baseUrl) ? url : baseUrl;
    //   return result;
    // },
  },
  pages: {
    signIn: "/login",
    error: "/error",
    verifyRequest: "/verify-request",
  },
});
