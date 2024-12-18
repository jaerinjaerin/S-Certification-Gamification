"use client";

import { SessionProvider } from "next-auth/react";

import React from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth`;
  console.log("baseUrl", baseUrl);
  return <SessionProvider basePath={baseUrl}>{children}</SessionProvider>;
  // return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;
