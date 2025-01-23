import { Version } from "@/components/version";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_ASSETS_DOMAIN || "https://assets.samsungplus.net"
  ),
  title: "Samsung+ Certification Gamification",
  description: "Samsung+ Certification Gamification",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/splus_logo.png`,
  },
  openGraph: {
    images: [
      `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg`,
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`font-sharpSans font-bold antialiased`}>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        {children}
        <Version />
      </body>
    </html>
  );
}
