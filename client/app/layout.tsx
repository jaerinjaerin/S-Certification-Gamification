import { Version } from "@/components/version";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_ASSETS_DOMAIN || "https://assets.samsungplus.net"
  ),
  title: "Be a Galaxy AI Expert(S25)",
  description: "Be a Galaxy AI Expert",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/comomon/images/splus_logo.png`,
  },
  openGraph: {
    images: [
      `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/comomon/images/background/meta.jpg`,
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
