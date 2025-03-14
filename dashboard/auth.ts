/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from '@/model/prisma';
import type { Adapter } from '@auth/core/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { AuthType, User } from '@prisma/client';
import NextAuth, { DefaultSession, Session } from 'next-auth';
import {
  fetchOrganizationDetails,
  SumtotalProfile,
} from './services/auth/sumtotal';
import { encrypt } from './utils/encrypt';

type UserProps = User & { loginName: string };

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      provider: string;
      authType: AuthType;
      loginName: string;
    } & DefaultSession['user'];
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    {
      id: 'sumtotal',
      name: 'SumTotal',
      type: 'oauth',
      authorization: {
        url: 'https://samsung.sumtotal.host/apisecurity/connect/authorize',
        params: {
          scope: 'allapis offline_access',
          prompt: 'select_account',
          redirect_uri: process.env.SUMTOTAL_CALLBACK_URL,
        },
      },
      token: 'https://samsung.sumtotal.host/apisecurity/connect/token',
      userinfo: 'https://samsung.sumtotal.host/apis/api/v2/advanced/users',
      clientId: process.env.SUMTOTAL_CLIENT_ID,
      clientSecret: process.env.SUMTOTAL_CLIENT_SECRET,
      profile: async (profile: SumtotalProfile, tokens) => {
        // console.log('profile:', profile);
        // // console.log("accessToken:", tokens.access_token);
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

        return {
          id: encrypt(profile.userId, true),
          emailId:
            profile.businessAddress.email1 != null
              ? encrypt(profile.businessAddress.email1, true)
              : null,
          name:
            process.env.NODE_ENV !== 'production'
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
          loginName: encrypt(profile.userLogin.username, true),
        };
      },
    },
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 365 * 24 * 60 * 60, //365일
  },
  callbacks: {
    jwt: async ({ token, profile, user, account }) => {
      // console.log('auth callbacks jwt', token, profile, user, account);
      if (account) {
        token.provider = account.provider;
      }
      if (user) {
        token.authType = (user as User).authType;
        token.loginName = (user as UserProps).loginName;
      }
      return token;
    },
    session: async (params): Promise<Session | DefaultSession> => {
      const { session } = params;
      // // console.log("auth callbacks session", session);

      // JWT 전략일 경우 token을 사용
      if ('token' in params) {
        const { token } = params;

        if (session.user && token.sub) {
          session.user.id = token.sub;
          session.user.provider = (token as any).provider;
          session.user.authType = (token as any).authType;
          session.user.loginName = (token as any).loginName;
        }
      }

      // Database 전략일 경우 추가 로직이 필요하면 여기서 처리
      if ('user' in params) {
        const { user } = params;

        if (session.user) {
          session.user.id = user.id;
        }
      }

      return session;
    },
    authorized: ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isOnSignupPage = nextUrl.pathname.startsWith('/signup');

      if (isLoggedIn) {
        if (isOnLoginPage || isOnSignupPage) {
          return Response.redirect(new URL('/', nextUrl));
        }
      }

      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
    verifyRequest: '/verify-request',
  },
});
