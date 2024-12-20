"use client";

import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import Spinner from "@/app/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { cn, fixedClass } from "@/lib/utils";
import { signIn, useSession } from "next-auth/react";

export default function Login() {
  const { status } = useSession();

  const videoMp4Url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/videos/bg.mp4`;
  const videoWebmUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/videos/bg.webm`;

  if (status === "loading") {
    return <Spinner />;
  }

  return (
    <>
      <div className={cn("h-svh", fixedClass)}>
        <video
          className="w-full h-svh object-fill absolute "
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoMp4Url} type="video/mp4" />
          <source src={videoWebmUrl} type="video/webm" />
        </video>
        <div className="flex flex-col items-center h-full py-[20px] relative">
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
