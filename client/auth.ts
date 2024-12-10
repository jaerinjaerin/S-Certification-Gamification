import { prisma } from "@/prisma-client";
import type { Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthType } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvier from "next-auth/providers/google";
import { SumtotalProfile } from "./app/lib/auth/sumtotal";
const uuid = require("uuid");

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      // providerUserId: string;
      // providerPersonId: string;
      provider: string;
      // sumtotalOrganizationIds: string | null;
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
        },
      },
      token: "https://samsung.sumtotal.host/apisecurity/connect/token",
      userinfo: "https://samsung.sumtotal.host/apis/api/v2/advanced/users",
      clientId: process.env.SUMTOTAL_CLIENT_ID,
      clientSecret: process.env.SUMTOTAL_CLIENT_SECRET,
      profile: async (profile: SumtotalProfile, tokens) => {
        console.log("profile:", profile);
        console.log("accessToken:", tokens.access_token);
        // 이 값이 User 모델에 저장됨. 여기에 전달되는 값은 User 스키마에 정의된 필드만 사용 가능

        const accessToken = tokens.access_token;
        // job 및 store 추출
        let jobId: string | null = null;
        let storeId: string | null = null;
        let channelSegmentId: string | null = null;

        if (accessToken) {
          const orgIds: string[] = profile.personOrganization.map((org) =>
            org.organizationId.toString()
          );

          const fetchOrganizationData = async (
            orgId: string,
            accessToken: string
          ) => {
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

              return await response.json(); // 요청 성공 시 데이터 반환
            } catch (error) {
              console.error(`Error fetching data for orgId ${orgId}:`, error);
              return null; // 실패한 요청은 null 반환
            }
          };

          const results = await Promise.all(
            orgIds.map((orgId) => fetchOrganizationData(orgId, accessToken))
          );

          results.forEach((result: any) => {
            if (!result) return; // null인 경우 건너뜀

            // const text9 = result.data[0]?.optionalInfo.text9;
            // const text8 = result.data[0]?.optionalInfo.text8;
            // const integer1 = result.data[0]?.optionalInfo.integer1;

            // if (integer1 === 7 && !text9) {
            //   jobId = text9;
            // }

            // if (integer1 === 5 && !text9) {
            //   storeId = text9;
            // }

            // if (integer1 === 4 && !text8) {
            //   channelSegmentId = text8;
            // }

            const text9 = result.data[0]?.optionalInfo.text9;
            const text8 = result.data[0]?.optionalInfo.text8;
            const integer1 = result.data[0]?.optionalInfo.integer1;

            if (!text9 || !integer1) return;

            if (integer1 === "7" || integer1 === 7) {
              jobId = text9;
            }

            if (integer1 === "5" || integer1 === 5) {
              storeId = text9;
            }

            if (integer1 === "4" || integer1 === 4) {
              channelSegmentId = text8;
            }
          });
        }

        // TODO: regionId, subsidaryId, channelId 정보를 추가로 넣어야 함.

        return {
          id: profile.userId,
          name: profile.fullName ?? profile.userLogin.username ?? null,
          email: profile.businessAddress.email1 ?? null,
          image: profile.imagePath ?? null,
          authType: AuthType.SUMTOTAL,
          providerUserId: profile.userId,
          providerPersonId: profile.personId,
          sumtotalDomainId:
            profile.personDomain?.find((domain) => domain.isPrimary)?.code ||
            null,
          sumtotalJobId: jobId,
          sumtotalStoreId: storeId,
          sumtotalChannelSegmentId: channelSegmentId,
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
        console.log("Email + Code", email, code);

        // 이메일과 인증 코드 확인
        const tokenRecord = await prisma.verifyToken.findFirst({
          where: { email: email as string },
        });

        console.log("tokenRecord", tokenRecord);

        if (!tokenRecord) {
          throw new Error("Invalid email or code");
        }

        // 만료 시간 확인
        if (new Date() > tokenRecord.expiresAt) {
          await prisma.verifyToken.delete({ where: { id: tokenRecord.id } });
          throw new Error("Code expired");
        }

        // 인증 코드 확인
        if (tokenRecord.token !== code) {
          throw new Error("Invalid email or code");
        }

        let user = await prisma.user.findFirst({
          where: { email: email as string },
        });

        console.log("tokenRecord user", user);
        // 사용자 계정이 없으면 생성
        if (!user) {
          const userId = uuid.v4();

          const userEmail = await prisma.userEmail.create({
            data: {
              email: email as string,
              userId: userId,
            },
          });

          user = await prisma.user.create({
            data: {
              id: userId,
              name: "Guest User",
              emailId: userEmail.id,
              authType: AuthType.GUEST,
            },
          });
        }

        // 인증 코드 삭제
        await prisma.verifyToken.delete({ where: { id: tokenRecord.id } });

        // 선택 사항
        await prisma.verifyToken.deleteMany({
          where: {
            expiresAt: { lt: new Date() }, // 현재 시간보다 이전
          },
        });

        return user;
      },
    }),
    GoogleProvier({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, //30일
  },
  events: {
    createUser: async (message) => {
      console.log("next-auth createUser", message);
      const { user } = message;
      if (user.email != null) {
        const userEmail = await prisma.userEmail.create({
          data: {
            email: user.email,
            userId: user.id,
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: {
            email: null,
            emailId: userEmail.id,
          },
        });
      }
    },
    // getUserByEmail: (email) => prisma.user.findFirst({ where: { email } }),
    linkAccount: ({ user, profile }) => {
      console.log("next-auth linkAccount", user, profile);
    },
  },
  callbacks: {
    jwt: async ({ token, profile, user, account }) => {
      // console.log("auth callbacks jwt", token, profile, user, account);
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
        session.user.provider = token.provider as string;
      }
      return session;
    },
    authorized: ({ auth }) => {
      // console.log('next-auth authorized', auth)
      return !!auth?.user; // this ensures there is a logged in user for -every- request
    },
  },
  pages: {
    signIn: "/login",
    // signOut: '/login',
    // newUser
    error: "/error",
    verifyRequest: "/verify-request",
  },
});
