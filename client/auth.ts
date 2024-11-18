import { prisma } from "@/prisma-client";
import type { Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthType } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvier from "next-auth/providers/google";
import { SumtotalProfile } from "./app/lib/auth/sumtotal";

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      providerUserId: string;
      providerPersonId: string;
      authType: AuthType;
      // isGranted?: Boolean;
      // loginName?: string;
    } & DefaultSession["user"];
  }
}

// export const authOptions: NextAuthOptions =
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
      // if (!user.image && profile.image) {
      //   await prisma.user.update({
      //     where: { id: user.id },
      //     data: { image: profile.image },
      //   });
      // }
    },
  },
  callbacks: {
    jwt: async ({ token, profile: pf, user, account }) => {
      //
      // console.log('next-auth jwt', token, pf, user, account)
      if (user) {
        token.id = user.id;
        // token.image = user.image;
        // token.isGranted = false;
        // //
        // const granted = await grant(user.id);
        // token.isGranted = granted;
      }

      if (account) {
        token.access_token = account.access_token;
        token.expires_at = account.expires_at;

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
      //
      // if (pf) {
      //   const profile: SumtotalProfile | any = { ...pf };
      //   token.loginName = profile.userLogin.username;
      // }

      // if (account?.access_token) {
      //   token.access_token = account.access_token;
      // }
      return token;
    },
    session: async ({ session, token }) => {
      // console.log('next-auth session', session, token)
      if (session?.user && token.sub) {
        session.user.id = token.sub;
      }
      // if (session?.user && token) {
      //   token.id && (session.user.id = String(token.id));
      //   token.loginName && (session.user.loginName = String(token.loginName));
      //   token.isGranted != null &&
      //     (session.user.isGranted = Boolean(token.isGranted));
      // }
      //
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
