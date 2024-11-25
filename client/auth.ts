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
      providerUserId: string;
      providerPersonId: string;
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
        },
      },
      token: "https://samsung.sumtotal.host/apisecurity/connect/token",
      userinfo: "https://samsung.sumtotal.host/apis/api/v2/advanced/users",
      clientId: process.env.SUMTOTAL_CLIENT_ID,
      clientSecret: process.env.SUMTOTAL_CLIENT_SECRET,
      profile: (profile: SumtotalProfile) => {
        console.log("profile:", profile);
        // 이 값이 User 모델에 저장됨. 여기에 전달되는 값은 User 스키마에 정의된 필드만 사용 가능
        return {
          id: profile.userId,
          name: profile.fullName ?? profile.userLogin.username ?? null,
          email: profile.businessAddress.email1 ?? null,
          image: profile.imagePath ?? null,
          authType: AuthType.SUMTOTAL,
          providerUserId: profile.userId,
          providerPersonId: profile.personId,
          domainId:
            profile.personDomain?.find((domain) => domain.isPrimary)
              ?.domainId || null,
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

        let user = await prisma.user.findUnique({
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
    async linkAccount({ user, profile }) {
      console.log("next-auth linkAccount", user, profile);
    },
  },
  callbacks: {
    jwt: async ({ token, profile: pf, user, account }) => {
      console.log("auth callbacks jwt", token, pf, user, account);
      if (account) {
        // token.access_token = account.access_token;
        // token.expires_at = account.expires_at;
        token.accountType = account.type;

        const found_account = await prisma.account.findFirst({
          where: { providerAccountId: account.providerAccountId as string },
        });

        if (found_account) {
          await prisma.account.update({
            where: {
              id: found_account.id,
            },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at, // 새로운 만료 시간
            },
          });
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
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
