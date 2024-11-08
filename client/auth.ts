import { prisma } from '@/prisma-client';
import type { Adapter } from '@auth/core/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { DefaultSession } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvier from 'next-auth/providers/google';
import { createTransport } from 'nodemailer';
import { SumtotalProfile } from './app/lib/auth/sumtotal';
import {
  magicLinkEmailHtml,
  magicLinkEmailText,
} from './app/templete/emails/verification-template';

// const transporter = nodemailer.createTransport({
//   service: process.env.EMAIL_SERVER,
//   auth: {
//     user: process.env.EMAIL_SERVER_USER,
//     pass: process.env.EMAIL_SERVER_PASSWORD,
//   },
// });

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      isGranted?: Boolean;
      loginName?: string;
    } & DefaultSession['user'];
  }
}

// export const authOptions: NextAuthOptions =
export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  events: {
    createUser: async (message) => {
      console.log('next-auth createUser', message);
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
  },
  providers: [
    // SumTotalProvider({
    //   clientId: process.env.AUTH_SUMTOTAL_ID!,
    //   clientSecret: process.env.AUTH_SUMTOTAL_SECRET!,
    //   callbackUrl: process.env.AUTH_SUMTOTAL_CALLBACK,
    // }),
    {
      id: 'sumtotal',
      name: 'SumTotal',
      type: 'oauth',
      authorization: {
        url: 'https://samsung.sumtotal.host/apisecurity/connect/authorize',
        params: {
          scope: 'allapis',
        },
      },
      token: 'https://samsung.sumtotal.host/apisecurity/connect/token',
      userinfo: 'https://samsung.sumtotal.host/apis/api/v2/advanced/users',
      clientId: process.env.AUTH_SUMTOTAL_ID,
      clientSecret: process.env.AUTH_SUMTOTAL_SECRET,
      profile: (profile: SumtotalProfile) => {
        console.log('profile:', profile);
        return {
          id: profile.userId,
          name: profile.fullName,
          email: profile.businessAddress.email1 ?? null,
          image: profile.imagePath ?? null,
        };
      },
      // callbackUrl: process.env.AUTH_SUMTOTAL_CALLBACK,
      // options,
    },
    GoogleProvier({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT as unknown as number,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
        theme,
      }) {
        console.log('sendVerificationRequest', email, url, server, from, theme);
        // const { identifier, url, provider, theme } = params;
        const { host } = new URL(url);
        // NOTE: You are not required to use `nodemailer`, use whatever you want.
        const transport = createTransport(server);
        const result = await transport.sendMail({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: `Sign in to ${host}`,
          text: magicLinkEmailText({ url, host }),
          html: magicLinkEmailHtml({ url, host, theme }),
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`);
        }
      },
      normalizeIdentifier(identifier: string): string {
        // Get the first two elements only,
        // separated by `@` from user input.
        let [local, domain] = identifier.toLowerCase().trim().split('@');
        // The part before "@" can contain a ","
        // but we remove it on the domain part
        domain = domain.split(',')[0];
        return `${local}@${domain}`;

        // You can also throw an error, which will redirect the user
        // to the error page with error=EmailSignin in the URL
        // if (identifier.split("@").length > 2) {
        //   throw new Error("Only one email allowed")
        // }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, //30일
  },
  callbacks: {
    jwt: async ({ token, profile: pf, user, account }) => {
      //
      console.log('next-auth jwt', token, pf, user, account);
      if (user) {
        token.id = user.id;
        // token.image = user.image;
        // token.isGranted = false;
        // //
        // const granted = await grant(user.id);
        // token.isGranted = granted;
      }
      //
      if (pf) {
        const profile: SumtotalProfile | any = { ...pf };
        token.loginName = profile.userLogin.username;
      }
      //
      return token;
    },
    session: async ({ session, token }) => {
      console.log('next-auth session', session, token);
      if (session?.user && token) {
        token.id && (session.user.id = String(token.id));
        token.loginName && (session.user.loginName = String(token.loginName));
        token.isGranted != null &&
          (session.user.isGranted = Boolean(token.isGranted));
      }
      //
      return session;
    },
    authorized: ({ auth }) => {
      console.log('next-auth authorized', auth);
      return !!auth?.user; // this ensures there is a logged in user for -every- request
    },
  },
  // callbacks: {
  // async session({ session, token, user }) {
  //   // 사용자 정보나 토큰 데이터를 세션에 추가
  //   // session.user.id = user?.id || token.sub;
  //   // session.user.role = user?.role || 'user';
  //   // if (session?.user?.profileId == null) {
  //   // if (user?.profileId == null) {
  //   // }
  //   console.log('next-auth session', session, token, user);
  //   if (session?.user) {
  //     session.user.id = token.sub;
  //   }
  //   return session;
  // },
  // async jwt({ token, user, account, profile, isNewUser }) {
  //   // console.log("next-auth jwt", token, user, account, profile, isNewUser);
  //   return token;
  // },
  // jwt: async ({ token, profile: pf, user, account }) => {
  //   //
  //   // if (user) {
  //   //   token.id = user.id;
  //   //   token.image = user.image;
  //   //   token.isGranted = false;
  //   //   //
  //   //   // const granted = await grant(user.id);
  //   //   // token.isGranted = granted;
  //   // }
  //   // //
  //   // if (pf) {
  //   //   const profile: SumtotalProfile | any = { ...pf };
  //   //   token.loginName = profile.userLogin.username;
  //   // }
  //   //
  //   return token;
  // },
  // session: async ({ session, token }) => {
  //   if (session?.user && token) {
  //     token.id && (session.user.id = String(token.id));
  //     token.loginName && (session.user.loginName = String(token.loginName));
  //     token.isGranted != null &&
  //       (session.user.isGranted = Boolean(token.isGranted));
  //   }
  //   //
  //   return session;
  // },
  // authorized: ({ auth }) => {
  //   return !!auth?.user; // this ensures there is a logged in user for -every- request
  // },
  // },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/error',
    verifyRequest: '/verify-request',
  },
});
