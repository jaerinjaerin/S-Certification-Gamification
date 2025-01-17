"use client";

import { AuthType } from "@prisma/client";
// import { useLocalStorage } from "@/providers/local_storage_provider";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { status, data: session } = useSession();
  console.log("Home session", session);

  // const sendTestGetScore = async () => {
  //   console.log("get score");
  //   const response = await fetch(
  //     `${process.env.NEXT_PUBLIC_BASE_PATH}/api/campaigns/score?userId=user_0&quizStageIndex=3&campaignId=s24`,
  //     {
  //       method: "GET",
  //       cache: "no-store",
  //     }
  //   );
  //   const data = await response.json();
  //   console.log("get score", data);
  // };

  // const sendTestEmail = async () => {
  //   await fetch(
  //     `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/send-verify-email`,
  //     {
  //       method: "POST",
  //       body: JSON.stringify({
  //         toAddress: "bluedevstorm@gmail.com",
  //         subject: "Autherntication Code for Galaxy AI Expert.",
  //         bodyHtml: `
  //           <!DOCTYPE html>
  //           <html>
  //             <head>
  //               <style>
  //                 body {
  //                   margin: 0;
  //                   padding: 0;
  //                   font-family: Arial, sans-serif;
  //                   background-color: #000000;
  //                   color: #333333;
  //                 }
  //                 .email-container {
  //                   max-width: 840px;
  //                   width: 100%;
  //                   height: 414px;
  //                   margin: 0 auto;
  //                   background-color: #ffffff;
  //                   padding: 80px;
  //                   border-radius: 10px;
  //                   text-align: center;
  //                   background-image: url("https://assets-stage.samsungplus.net/certification/common/images/bg_pattern_01.jpg");
  //                   background-repeat: repeat;
  //                   background-size: 50%;
  //                   background-position: center;
  //                 }
  //                 .header {
  //                   font-size: 18px;
  //                   font-weight: bold;
  //                   margin-bottom: 20px;
  //                 }
  //                 .code {
  //                   font-size: 48px;
  //                   font-weight: bold;
  //                   margin: 20px 0;
  //                 }
  //                 .message {
  //                   font-size: 14px;
  //                   color: #555555;
  //                   margin-top: 20px;
  //                 }
  //                 .footer {
  //                   font-size: 12px;
  //                   color: #aaaaaa;
  //                   margin-top: 30px;
  //                   text-align: center;
  //                 }
  //               </style>
  //             </head>
  //             <body>
  //               <div class="email-container">
  //                 <div class="header">S+ Galaxy AI Expert(Paradigm)</div>
  //                 <div class="code">
  //                   $CODE$
  //                 </div>
  //                 <div class="message">
  //                   Please enter this code on the verification page to complete the
  //                   process.<br />
  //                   For your security, this code will expire in [time limit, e.g., 5
  //                   minutes].
  //                 </div>
  //               </div>
  //               <div class="footer">
  //                 This message was automatically delivered by Samsung+ service. Do not reply
  //                 to this message.<br />
  //                 Copyright © 2024 SAMSUNG all rights reserved.
  //               </div>
  //             </body>
  //           </html>
  //         `,
  //       }),
  //     }
  //   );
  // };

  // const sendTestBadgeEmail = async () => {
  //   const badgeImageUrl =
  //     "https://assets-stage.samsungplus.net/certification/s25/images/badge/badge_stage3.png";
  //   await fetch(
  //     `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/send-verify-email`,
  //     {
  //       method: "POST",
  //       body: JSON.stringify({
  //         toAddress: "bluedevstorm@gmail.com",
  //         subject: "You have earned the Galaxy AI Expert Badge.",
  //         bodyHtml: `
  //           <!DOCTYPE html>
  //             <html>
  //               <head>
  //                 <style>
  //                   body {
  //                     margin: 0;
  //                     padding: 0;
  //                     font-family: Arial, sans-serif;
  //                     background-color: #000000;
  //                     color: #333333;
  //                   }
  //                   .email-container {
  //                     max-width: 840px;
  //                     width: 100%;
  //                     height: 414px;
  //                     margin: 0 auto;
  //                     background-color: #ffffff;
  //                     padding: 40px;
  //                     border-radius: 10px;
  //                     text-align: center;
  //                     background-image: url("https://assets-stage.samsungplus.net/certification/common/images/bg_pattern_01.jpg"); /* 배경 패턴 URL */
  //                     background-repeat: repeat;
  //                     background-size: 50%;
  //                     background-position: center;
  //                   }
  //                   .header {
  //                     font-size: 18px;
  //                     font-weight: bold;
  //                     margin-bottom: 20px;
  //                   }
  //                   .badge-image {
  //                     margin: 20px auto;
  //                     width: 120px;
  //                     height: 120px;
  //                   }
  //                   .badge-title {
  //                     font-size: 16px;
  //                     font-weight: bold;
  //                     margin: 10px 0;
  //                   }
  //                   .date {
  //                     font-size: 14px;
  //                     margin: 5px 0 20px 0;
  //                     color: #555555;
  //                   }
  //                   .congratulations {
  //                     font-size: 14px;
  //                     font-weight: bold;
  //                     margin-top: 20px;
  //                   }
  //                   .footer {
  //                     font-size: 12px;
  //                     color: #aaaaaa;
  //                     margin-top: 30px;
  //                     text-align: center;
  //                   }
  //                 </style>
  //               </head>
  //               <body>
  //                 <div class="email-container">
  //                   <div class="header">S+ Galaxy AI Expert(Paradigm)</div>
  //                   <img
  //                     src="${badgeImageUrl}"
  //                     alt="Galaxy AI Expert Badge"
  //                     class="badge-image"
  //                   />
  //                   <div class="congratulations">
  //                     Congratulations!<br />
  //                     You have earned the Galaxy AI Expert Badge.
  //                   </div>
  //                 </div>
  //                 <div class="footer">
  //                   This message was automatically delivered by Samsung+ service. Do not reply
  //                   to this message.<br />
  //                   Copyright © 2024 SAMSUNG all rights reserved.
  //                 </div>
  //               </body>
  //             </html>

  //         `,
  //       }),
  //     }
  //   );
  // };

  const processSignOut = async (event) => {
    event.preventDefault();

    const callbackUrl = `${window.location.protocol}//${window.location.host}/home`;
    let signOutUrl = callbackUrl;

    sessionStorage.clear();
    if (session?.user?.authType === AuthType.SUMTOTAL) {
      // 삼플 유저 로그아웃

      signOutUrl = `${process.env.NEXT_PUBLIC_AUTH_SUMTOTAL_SIGNOUT}${callbackUrl}`;
      console.log("sumtotal signout", signOutUrl);
      await signOut({
        redirect: false, // NextAuth의 기본 리디렉션을 방지
      });
      window.location.href = signOutUrl;
      return;
    }

    console.log("signout");

    // 패스워드 유저 로그아웃
    await signOut();
  };

  if (session) {
    return (
      <div
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        :) Signed in as {session.user?.email} {session.user?.name}
        <br />
        <button onClick={processSignOut}>Sign out</button>
        <br />
        <br />
        {/* <button
          onClick={() => {
            sendTestEmail();
          }}
        >
          Send Email
        </button>
        <br />
        <br />
        <button
          onClick={() => {
            sendTestBadgeEmail();
          }}
        >
          Send Badge Email
        </button>
        <br />
        <br /> */}
        {/* <button
          onClick={() => {
            sendTestGetScore();
          }}
        >
          Test Get Score
        </button> */}
      </div>
    );
  }

  // const processSignIn = async () => {
  //   const result = await signIn("sumtotal");
  //   console.log("result", result);
  // };

  return (
    <div
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* <h1>Sumtotal Test Login</h1>
      <button
        onClick={() => {
          processSignIn();
        }}
        disabled={status === "loading"}
      >
        Sign in with Sumtotal
      </button>
      <br />
      <br /> */}
      {/* <button
        onClick={() => {
          sendTestEmail();
        }}
      >
        Send Email
      </button> */}
      {/* <br />
      <br /> */}
      <h1>삼플 사용자 테스트 주소</h1>
      <ul>
        <li>
          <Link href="/s25/OrgCode-7_en-US">HQ Retail Team</Link>
          <br />
          <Link href="/s25/NAT_7000_fr-CA">Canada</Link>
          <br />
          <Link href="/s25/NAT_2348_hu">Hungary</Link>
          <br />
          <Link href="/s25/NAT_2344_zh-TW">Hongkong</Link>
          <br />
          <Link href="/s25/NAT_2360_id">Indonesia</Link>
          <br />
          <Link href="/s25/NAT_2764_th">Thailand</Link>
          <br />
          <Link href="/s25/NAT_051001_en-US">Australia</Link>
          <br />
          {/* <Link href="/s25/NAT_2458_en-US">Malaysia</Link> */}
          {/* <br /> */}
          <Link href="/s25/NAT_2704_vi">Vietnam</Link>
          <br />
          {/* <Link href="/s25/NAT_2608_en-US">Philippines</Link>
          <br /> */}
          <Link href="/s25/NAT_2356_en-US">India</Link>
          <br />
          <Link href="/s25/NAT_2076_pt-BR">Brazil</Link>
          <br />
          {/* <Link href="/s25/NAT_2792_tr">Turkey</Link>
          <br /> */}
          <Link href="/s25/NAT_2275_ar-AE">Palestine</Link>
          <br />
          <Link href="/s25/NAT_3004_my">Myanmar</Link>
          <br />
          <Link href="/s25/NAT_2792_tr">Turkiye</Link>
          <br />
        </li>
      </ul>
      <br />
      <br />
      <h1>삼플 미사용자 테스트 주소</h1>
      <Link href="/s25">Link</Link>
      {/* <button
        onClick={() => {
          sendTestGetScore();
        }}
      >
        Test Get Score
      </button> */}
      {status === "loading" && <p>Loading...</p>}
    </div>
  );
}
