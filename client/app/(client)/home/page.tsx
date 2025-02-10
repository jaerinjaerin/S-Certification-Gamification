"use client";

import Spinner from "@/components/ui/spinner";
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
    return <Spinner />;
  }

  if (session) {
    return (
      // <div
      //   style={{
      //     backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg')`,
      //     backgroundSize: "cover",
      //     backgroundRepeat: "no-repeat",
      //     backgroundPosition: "center",
      //   }}
      // >
      //   :) Signed in as {session.user?.email} {session.user?.name}
      //   <br />
      //   <button onClick={processSignOut}>Sign out</button>
      //   <br />
      //   <br />
      // </div>

      <div
        className="h-full bg-[#F0F0F0] w-full min-h-svh mx-auto text-base flex flex-col justify-center space-y-[19px]"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/bg_main2.jpg')`,
        }}
      >
        <h1 className="text-xl text-center text-[#2686F5]">
          :) Signed in as {session.user?.email} {session.user?.name}
        </h1>

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={processSignOut}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto text-base flex flex-col justify-center space-y-[19px]">
      <h1 className="text-xl text-center text-[#2686F5]">Not signed in</h1>
    </div>
  );
}
