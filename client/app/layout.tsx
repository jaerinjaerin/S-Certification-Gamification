import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Samsung+ Certification Gamification",
  description: "Samsung+ Certification Gamification",
};

async function fetchData(quizSetId: string | null) {
  if (!quizSetId) return null;

  try {
    const response = await fetch(`${process.env.API_URL}/api/campaigns/quizset_path/${quizSetId}`, {
      cache: "force-cache",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex justify-center`}>{children}</body>
    </html>
  );
}
