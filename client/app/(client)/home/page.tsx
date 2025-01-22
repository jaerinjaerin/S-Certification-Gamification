"use client";

import { AuthType } from "@prisma/client";
// import { useLocalStorage } from "@/providers/local_storage_provider";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { status, data: session } = useSession();

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
          <Link href="/s25/NAT_2344_zh-HK">Hongkong</Link>
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
