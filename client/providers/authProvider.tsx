"use client";

import { SessionProvider } from "next-auth/react";

import React from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth`;
  return <SessionProvider basePath={baseUrl}>{children}</SessionProvider>;
};

export default AuthProvider;
