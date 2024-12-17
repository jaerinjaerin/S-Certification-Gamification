"use client";

import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import { Button } from "@/components/ui/button";
// import {
//   AlertDialog,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { useLocalStorage } from "@/providers/local_storage_provider";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Login() {
  const { status, data: session } = useSession();

  console.log("status", status);

  if (session) {
    return (
      <>
        :) Signed in as {session.user?.email}
        <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  const bgImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/bg_01.png`;
  const processSignIn = async () => {
    const result = await signIn("sumtotal");
    console.log("result", result);
  };

  return (
    <>
      <div
        className="py-[20px] h-full bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImageUrl})`,
        }}
      >
        <div className="flex flex-col items-center">
          <span className="block font-extrabold">Galaxy AI Expert</span>

          <div className="flex flex-col items-center">
            <div className="mb-[70px]">
              <span className="block mt-[180px] font-extrabold text-[44px] text-center mb-5">
                Be a Galaxy AI Expert! (Paradigm)
              </span>
              <span className="block text-[30px] font-medium text-center uppercase">
                certification
              </span>
            </div>
            <Button
              variant={"primary"}
              onClick={() => processSignIn()}
              disabled={status === "loading"}
              className="font-extrabold text-[18px]"
            >
              s+ login
            </Button>
          </div>
          <PrivacyAndTerm />
        </div>
      </div>

      {/* error alert dialog */}
      {/* <AlertDialog open={!!error}>
        <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Alert</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                console.log("close");
              }}
            >
              OK
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </>
  );
}
