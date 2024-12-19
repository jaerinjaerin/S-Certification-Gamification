import type { Metadata } from "next";
import "./globals.css";
import { one, samsungSans } from "./font/font";

export const metadata: Metadata = {
  title: "Samsung+ Certification Gamification",
  description: "Samsung+ Certification Gamification",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${samsungSans.className} ${one.variable} font-bold antialiased bg-yellow-50`}>{children}</body>
    </html>
  );
}
