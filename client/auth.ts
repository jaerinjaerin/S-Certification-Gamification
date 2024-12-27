import { prisma } from "@/prisma-client";
import type { Adapter, AdapterUser } from "@auth/core/adapters";
import { JWT } from "@auth/core/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthType, User } from "@prisma/client";
import NextAuth, { DefaultSession, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  fetchOrganizationDetails,
  SumtotalProfile,
} from "./app/lib/auth/sumtotal";
import { encryptEmail } from "./utils/encrypt";

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      // providerUserId: string;
      // providerPersonId: string;
      provider: string;
      authType: AuthType;
      // sumtotalOrganizationIds: string | null;
    } & DefaultSession["user"];
  }
}

type SessionParams =
  | { session: Session; user: AdapterUser }
  | { session: Session; token: JWT };

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
      // redirectProxyUrl: process.env.SUMTOTAL_CALLBACK_URL,
      // callbackUrl: process.env.SUMTOTAL_CALLBACK_URL,
      // callback: process.env.SUMTOTAL_CALLBACK_URL,
      profile: async (profile: SumtotalProfile, tokens) => {
        console.log("profile:", profile);
        // console.log("accessToken:", tokens.access_token);
        // 이 값이 User 모델에 저장됨. 여기에 전달되는 값은 User 스키마에 정의된 필드만 사용 가능

        const accessToken = tokens.access_token;
        // job 및 store 추출

        let jobId: string | null = null;
        let storeId: string | null = null;
        let storeSegmentText: string | null = null;
        let channelId: string | null = null;
        let channelSegmentId: string | null = null;

        if (accessToken) {
          const result = await fetchOrganizationDetails(accessToken, profile);
          if (result) {
            jobId = result.jobId;
            storeId = result.storeId;
            storeSegmentText = result.storeSegmentText;
            channelId = result.channelId;
            channelSegmentId = result.channelSegmentId;
          }
        }

        // 확인 regionId, subsidaryId
        let regionId: string | null = null;
        let subsidaryId: string | null = null;
        const domainCode = profile.personDomain?.find(
          (domain) => domain.isPrimary
        )?.code;
        if (domainCode) {
          const domain = await prisma.domain.findFirst({
            where: {
              code: domainCode,
            },
            include: {
              subsidary: {
                include: {
                  region: true,
                },
              },
            },
          });

          if (domain) {
            regionId = domain.subsidary?.regionId || null;
            subsidaryId = domain.subsidaryId;
          }
        }

        return {
          id: profile.userId,
          // email:
          //   profile.businessAddress.email1 != null
          //     ? encryptEmail(profile.businessAddress.email1)
          //     : null,
          emailId:
            profile.businessAddress.email1 != null
              ? encryptEmail(profile.businessAddress.email1)
              : null,
          name:
            process.env.NODE_ENV !== "production"
              ? profile.businessAddress.email1
              : null,
          image: profile.imagePath ?? null,
          authType: AuthType.SUMTOTAL,
          providerUserId: profile.userId,
          providerPersonId: profile.personId,
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
          subsidaryId: subsidaryId,
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

        // // 이메일과 인증 코드 확인
        // const tokenRecord = await prisma.verifyToken.findFirst({
        //   where: { email: email as string },
        // });

        // console.log("tokenRecord", tokenRecord);

        // if (!tokenRecord) {
        //   throw new Error("Invalid email or code");
        // }

        // // 만료 시간 확인
        // if (new Date() > tokenRecord.expiresAt) {
        //   await prisma.verifyToken.delete({ where: { id: tokenRecord.id } });
        //   throw new Error("Code expired");
        // }

        // // 인증 코드 확인
        // if (tokenRecord.token !== code) {
        //   throw new Error("Invalid email or code");
        // }

        const encryptedEmail = encryptEmail(email as string);

        let user = await prisma.user.findFirst({
          where: { emailId: encryptedEmail },
        });

        console.log("tokenRecord user", user);
        // 사용자 계정이 없으면 생성
        if (!user) {
          // const userId = uuid.v4();

          // const userEmail = await prisma.userEmail.create({
          //   data: {
          //     email: encryptedEmail,
          //     userId: userId,
          //   },
          // });

          user = await prisma.user.create({
            data: {
              // id: userId,
              name: "Guest User",
              // email: encryptedEmail,
              emailId: encryptedEmail,
              authType: AuthType.GUEST,
            },
          });
        }

        // // 인증 코드 삭제
        // await prisma.verifyToken.delete({ where: { id: tokenRecord.id } });

        // // 선택 사항
        // await prisma.verifyToken.deleteMany({
        //   where: {
        //     expiresAt: { lt: new Date() }, // 현재 시간보다 이전
        //   },
        // });

        return user;
      },
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
      // const { user } = message;
      // if (user.email != null) {
      //   const userEmail = await prisma.userEmail.create({
      //     data: {
      //       email: user.email,
      //       userId: user.id,
      //     },
      //   });

      //   await prisma.user.update({
      //     where: { id: user.id },
      //     data: {
      //       email: null,
      //       emailId: userEmail.id,
      //     },
      //   });
      // }
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
      if (user) {
        token.authType = (user as User).authType;
      }
      return token;
    },
    session: async (params): Promise<Session | DefaultSession> => {
      const { session } = params;
      // console.log("auth callbacks session", session);

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
      // if (session?.user && token.sub) {
      //   session.user.id = token.sub;
      //   session.user.provider = token.provider as string;
      // }
      // return session;
    },
    authorized: ({ auth }) => {
      console.log("next-auth authorized", auth);
      return !!auth?.user; // this ensures there is a logged in user for -every- request
    },
    redirect: async ({ url, baseUrl }) => {
      const result = url.startsWith(baseUrl) ? url : baseUrl;
      return result;
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
