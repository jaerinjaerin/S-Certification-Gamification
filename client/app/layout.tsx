import AuthProvider from "@/providers/auth_provider";
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
    const response = await fetch(
      `${process.env.API_URL}/api/campaign/quiz_set/${quizSetId}`,
      {
        cache: "force-cache",
      }
    );
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

export default async function RootLayout({
  children,
}: // params,
{
  children: React.ReactNode;
  // searchParams?: { [key: string]: string | string[] | undefined };
  // params: Promise<{ quizsetId: string }>;
}) {
  // const { quizsetId } = await params;

  // const queryParam = searchParams.param || null; // 쿼리스트링에서 'param' 값 가져오기
  // const data = await fetchData(queryParam);

  // const queryParam = searchParams?.param || null; // 'param' 값 가져오기

  // console.log("RootLayout", params, quizsetId);

  // const data = await fetchData("2319515d-17f4-4817-ad08-d9d61a0cbc71");
  // console.log("data", data);

  // if (!data) {
  //   window.location.href = "/error/invalid-access";
  // }

  // if (!data.item.campaign) {
  //   window.location.href = "/error/invalid-access";
  // }

  // if (data.item.campaign.startedAt < new Date()) {
  //   window.location.href = "/error/invalid-access";
  // }

  // if (data.item.campaign.endedAt > new Date()) {
  //   window.location.href = "/error/campaign-closed";
  // }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* {children} */}
        {/* <LocalStorageProvider> */}
        <AuthProvider>
          {/* <QuizProvider ></QuizProvider> */}
          {children}
          {/* <QuizProvider>
            <QuizProviderWrapper></QuizProviderWrapper>
          </QuizProvider> */}
        </AuthProvider>
        {/* </LocalStorageProvider> */}
      </body>
    </html>
  );
}
