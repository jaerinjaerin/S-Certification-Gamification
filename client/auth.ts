import { prisma } from "@/prisma-client";
import type { Adapter } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthType, User } from "@prisma/client";
import NextAuth, { DefaultSession, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as uuid from "uuid";
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
      isTokenExpired?: boolean; // 토큰 만료 상태 추가
    } & DefaultSession["user"];
  }
}

function decodeJwt(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Invalid JWT format", err);
    return null;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  // logger: {
  //   error: console.error,
  //   warn: console.warn,
  //   debug: console.log,
  // },
  logger: {
    error(code, ...message) {
      console.error("auth log error", code, message);
    },
    warn(code, ...message) {
      console.warn("auth log warn", code, message);
    },
    debug(code, ...message) {
      console.debug("auth log debug", code, message);
    },
  },
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
        // console.log("profile:", profile);

        // if (typeof profile === "string") {
        //   if (profile.toString().includes("exceeded")) {
        // console.error("profile error:", profile);
        const accessToken = tokens.access_token;
        if (accessToken) {
          const decoded = decodeJwt(accessToken);
          console.log("decoded", decoded);
        }
        // const decoded = jwt.verify(accessToken);
        // console.log("decoded:", decoded);

        // return {
        //   id: uuid.v4(),
        //   emailId: "",
        //   name: null,
        //   image: null,
        //   authType: AuthType.SUMTOTAL,
        //   providerUserId: "",
        //   providerPersonId: null,
        //   domainId: null,
        //   domainCode: null,
        // };
        //   }
        // }
        // // console.log("accessToken:", tokens.access_token);
        // 이 값이 User 모델에 저장됨. 여기에 전달되는 값은 User 스키마에 정의된 필드만 사용 가능

        // const accessToken = tokens.access_token;
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

          if (profile?.userId == null) {
            console.error("profile.userId is null", profile);
            const decoded = decodeJwt(accessToken);
            if (decoded?.userid) {
              console.error("decoded?.userid", decoded?.userid);
              return {
                id: encrypt(decoded?.userid, true),
                emailId: null,
                name: null,
                image: null,
                authType: AuthType.SUMTOTAL,
                providerUserId: encrypt(decoded?.userid, true),
                providerPersonId: decoded?.personpk
                  ? encrypt(decoded?.personpk.toString(), true)
                  : null,
                domainId: null,
                domainCode: null,
                jobId: null,
                storeId: null,
                storeSegmentText: null,
                channelId: null,
                channelSegmentId: null,
                regionId: null,
                subsidiaryId: null,
                channelName: null,
              };
            }
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
        // console.error("profile.userId:", profile.userId);
        // try {
        //   encrypt(profile.userId, true);
        //   if (profile.userId) {
        //     encrypt(profile.businessAddress.email1, true);
        //   }
        //   if (profile.personId) {
        //     encrypt(profile.personId.toString(), true);
        //   }
        // } catch (error) {
        //   console.error("encrypt error:", error);
        //   console.error("profile:", profile);
        // }

        // let userId: string | null = null;
        // if (profile.userId) {
        //   userId = encrypt(profile.userId, true);
        // }
        // if (userId == null) {
        //   if (profile.businessAddress.email1) {
        //     console.error(
        //       "use profile.businessAddress.email1:",
        //       profile.businessAddress.email1
        //     );
        //     userId = encrypt(profile.businessAddress.email1, true);
        //   }
        // }
        // if (userId == null) {
        //   if (profile.personId) {
        //     console.error("use profile.personId:", profile.personId);
        //     userId = encrypt(profile.personId.toString(), true);
        //   }
        // }
        // if (userId == null) {
        //   console.error("use uuid.v4()");
        //   userId = uuid.v4();
        // }

        return {
          id: profile.userId ? encrypt(profile.userId, true) : uuid.v4(),
          // id: userId,
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
    maxAge: 24 * 60 * 60, // 24시간
    // maxAge: 60, // 1분
    // maxAge: 20, // 20초
    // maxAge: 2 * 60 * 60, // 2시간
  },
  callbacks: {
    jwt: async ({ token, profile, user, account }) => {
      console.log("🚀 ~ jwt: ~ token:", token);
      if (profile || user || account) {
        // console.log("auth callbacks jwt", token, profile, user, account);
      }

      if (account) {
        token.provider = account.provider;

        // SumTotal 계정인 경우 expires_at 정보 저장
        if (account.provider === "sumtotal") {
          token.accessTokenExpires = account.expires_at;
          token.refreshToken = account.refresh_token;
        }

        // DB에 토큰 정보 업데이트
        const userAccount = await prisma.account.findFirst({
          where: {
            userId: user.id,
          },
        });

        if (userAccount) {
          await prisma.account.update({
            where: {
              id: userAccount.id,
            },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            },
          });
        }
      }

      if (token.provider === "sumtotal" && !account && token?.sub) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account?user_id=${token.sub}`
        );

        if (response.ok) {
          const { result: responseData } = await response.json();

          if (responseData) {
            token.accessTokenExpires = responseData.expires_at;
            token.refreshToken = responseData.refresh_token;
          }
        } else {
          console.error("API 호출 실패", response.status);
        }
      }

      if (user) {
        token.authType = (user as User).authType;
      }

      // 토큰이 만료되었는지 확인
      if (token.provider === "sumtotal" && token.accessTokenExpires) {
        // const nowKST = new Date().getTime() + 9 * 60 * 60 * 1000;
        // const now = Math.floor(nowKST / 1000);
        const now = new Date().getTime() / 1000;
        token.isTokenExpired = (token.accessTokenExpires as number) < now;
      }

      return token;
    },
    session: async (params): Promise<Session | DefaultSession> => {
      const { session } = params;

      if ("token" in params) {
        const { token } = params;

        if (session.user && token.sub) {
          session.user.id = token.sub;
          session.user.provider = (token as any).provider;
          session.user.authType = (token as any).authType;
          session.user.isTokenExpired = (token as any).isTokenExpired;
        }

        if (
          (token as any).provider === "sumtotal" &&
          (token as any).isTokenExpired
        ) {
          return null as any;
        }
      }

      if ("user" in params) {
        const { user } = params;

        if (session.user) {
          session.user.id = user.id;
        }
      }

      return session;
    },
    authorized: ({ auth }) => {
      if ((auth?.user as any).isTokenExpired) {
        return false;
      }
      return !!auth?.user;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
    verifyRequest: "/verify-request",
  },
  events: {
    async signOut() {
      console.log("User signed out");
    },
  },
});
