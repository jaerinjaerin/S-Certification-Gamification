import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

// export async function verifyToken(email: string, token: string) {
//   const verifyToken = await prisma.verifyToken.findUnique({
//     where: { token },
//   });

//   if (!verifyToken) {
//     throw new Error("Invalid or expired token");
//   }

//   if (verifyToken.email !== email) {
//     throw new Error("Token does not match the email");
//   }

//   if (new Date() > verifyToken.expiresAt) {
//     throw new Error("Token has expired");
//   }

//   // 유효한 경우 토큰 삭제 (선택 사항)
//   await prisma.verifyToken.delete({ where: { id: verifyToken.id } });

//   return true;
// }

// export async function cleanExpiredTokens() {
//   await prisma.verifyToken.deleteMany({
//     where: {
//       expiresAt: { lt: new Date() }, // 현재 시간보다 이전
//     },
//   });
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body as { email: string; code: string };

    const verifyToken = await prisma.verifyToken.findFirst({
      where: { email: email },
    });

    if (!verifyToken) {
      Sentry.captureMessage("Verification email not sent");
      return NextResponse.json(
        {
          code: "EMAIL_NOT_SENT",
          error: "Verification email not sent",
        },
        { status: 400 }
      );
    }

    if (new Date() > verifyToken.expiresAt) {
      Sentry.captureMessage("Verification email expired");
      return NextResponse.json(
        {
          code: "EMAIL_EXPIRED",
          error: "Verification email expired",
        },
        { status: 400 }
      );
    }

    if (code !== verifyToken.token) {
      Sentry.captureMessage("Verification code does not match");
      return NextResponse.json(
        {
          code: "CODE_NOT_MATCH",
          error: "Verification code does not match",
        },
        { status: 400 }
      );
    }

    // await cleanExpiredTokens();
    // 만료된 토큰 삭제
    await prisma.verifyToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() }, // 현재 시간보다 이전
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });

    // await signIn("email", { email });

    // let userEmail = await prisma.userEmail.findFirst({
    //   where: { email: email },
    // });

    // if (!userEmail) {
    //   const userId = cuid();
    //   userEmail = await prisma.userEmail.create({
    //     data: {
    //       email: email,
    //       userId: userId,
    //     },
    //   });

    //   const user = await prisma.user.create({
    //     data: {
    //       userId: userId,
    //       emailId: userEmail.id,
    //       authType: AuthType.GUEST,
    //     },
    //   });
    // }

    // return NextResponse.json(
    //   { item: data },
    //   { status: data?.$metadata?.httpStatusCode }
    // );
    // return NextResponse.json({ item: userCampaignDomainLog }, { status: 200 });
  } catch (error: unknown) {
    Sentry.captureException(error);
    if (error instanceof Error) {
      console.error("Error verify code:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Unknown error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
