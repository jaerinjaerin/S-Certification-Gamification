"use server";

import { signOut } from "@/auth";

export async function checkAccessTokenExpired(userId: string) {
  // try {
  // const languages = await prisma.language.findMany();

  // if (!userId) {
  //     // return NextResponse.json(
  //     //   { message: "Missing required parameter: userId" },
  //     //   { status: 400 }
  //     // );

  //     return {
  //       success: false,
  //       status: 400,
  //       error: {
  //         code: "Missing required parameter: userId",
  //         message: errorMessage,
  //       },
  //     };
  //   }

  await signOut({
    redirect: false,
  });
  return true;
  // try {
  //   const account = await prisma.account.findFirst({
  //     where: {
  //       userId,
  //     },
  //   });

  //   if (account == null) {
  //     console.error("Acc count not found", userId);
  //     // return NextResponse.json(
  //     //   { message: "Account not found" },
  //     //   { status: 401 }
  //     // );
  //     return true;
  //     // return {
  //     //   success: false,
  //     //   status: 401,
  //     //   error: {
  //     //     code: "Account not found",
  //     //     message: "Account not found",
  //     //   },
  //     // };
  //   }

  //   if (account.expires_at == null) {
  //     console.error("Account has no expiry date", userId);
  //     // return {
  //     //   success: false,
  //     //   status: 401,
  //     //   error: {
  //     //     code: "Account has no expiry date",
  //     //     message: "Account has no expiry date",
  //     //   },
  //     // };
  //     return true;
  //     // return NextResponse.json(
  //     //   { message: "Account has no expiry date" },
  //     //   { status: 401 }
  //     // );
  //   }

  //   const expiresAt = new Date(account.expires_at * 1000);
  //   if (expiresAt < new Date()) {
  //     console.error("Account has expired", userId, expiresAt);

  //     // return {
  //     //   success: false,
  //     //   status: 401,
  //     //   error: {
  //     //     code: "Account has expired",
  //     //     message: "Account has expired",
  //     //   },
  //     // };
  //     return false;
  //   }

  //   return true;
  // } catch (error) {
  //   console.error("❌ Error fetching languages:", error);
  //   Sentry.captureException(error);

  //   const errorMessage =
  //     error instanceof Error ? error.message : "An unknown error occurred";

  //   return {
  //     success: false,
  //     status: 500,
  //     error: {
  //       code: "INTERNAL_SERVER_ERROR",
  //       message: errorMessage,
  //     },
  //   };
  // }
}
