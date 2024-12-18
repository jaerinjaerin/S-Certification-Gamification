"use client";

import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signIn, useSession } from "next-auth/react";

export default function Login() {
  const { status } = useSession();

  const bgImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/bg_01.png`;

  // TODO: loading 컴포넌트로 교체
  console.log(status);
  if (status === "loading") {
    return <div>loading...</div>;
  }

  return (
    <>
      <div
        className="py-[20px] h-full bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImageUrl})`,
        }}
      >
        <div className="flex flex-col items-center h-full">
          <span className="block font-extrabold">Galaxy AI Expert</span>
          <LoginTitle className="my-auto" />
          <PrivacyAndTerm />
        </div>
      </div>
    </>
  );
}

const LoginTitle = ({ className }: { className?: string }) => {
  const processSignIn = async () => {
    const result = await signIn("sumtotal");
    console.log("result", result);
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="mb-[70px]">
        <span className="block font-extrabold text-[44px] text-center mb-5">
          Be a Galaxy AI Expert! (Paradigm)
        </span>
        <span className="block text-[30px] font-medium text-center uppercase">
          certification
        </span>
      </div>
      <Button
        variant={"primary"}
        onClick={() => processSignIn()}
        className="font-extrabold text-[18px]"
      >
        s+ login
      </Button>
    </div>
  );
};
