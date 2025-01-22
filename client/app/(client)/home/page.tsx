"use client";

import { AuthType } from "@prisma/client";
// import { useLocalStorage } from "@/providers/local_storage_provider";
import { signOut, useSession } from "next-auth/react";

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
      // console.log("sumtotal signout", signOutUrl);
      await signOut({
        redirect: false, // NextAuth의 기본 리디렉션을 방지
      });
      window.location.href = signOutUrl;
      return;
    }

    // console.log("signout");

    // 패스워드 유저 로그아웃
    await signOut();
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

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
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <p>Not signed in</p>
    </div>
  );
}
