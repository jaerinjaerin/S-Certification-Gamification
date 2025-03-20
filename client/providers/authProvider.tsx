"use client";

import { AuthType } from "@prisma/client";
import { getSession, SessionProvider, signOut } from "next-auth/react";

import React from "react";

const checkSumTotalTokenExpiration = async () => {
  const session = await getSession();
  if (session?.user.authType === AuthType.SUMTOTAL) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/check-expiry?userId=${session.user.id}`
    );

    if (response.status >= 400 && response.status < 500) {
      await signOut({
        redirect: false,
      });
    }
  }
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  checkSumTotalTokenExpiration();
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth`;
  return <SessionProvider basePath={baseUrl}>{children}</SessionProvider>;
};

export default AuthProvider;
