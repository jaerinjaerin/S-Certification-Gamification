"use client";

import process from "process";

import packageJson from "@/package.json";

export function Version() {
  const env = (process.env.NEXT_PUBLIC_ENV ?? "default").toUpperCase();
  const version = packageJson.version;
  const label = "Environment: " + env + ", Version:" + version;
  console.log(label);
  return <div className={"hidden"}>${label}</div>;
}
