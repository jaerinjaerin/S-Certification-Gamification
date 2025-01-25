"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { signIn } from "next-auth/react";

export default function Login() {
  const processSignIn = async () => {
    await signIn("sumtotal");
  };

  return (
    <>
      <div className={cn("h-svh")}>
        <div className="object-fill w-full h-svh">
          <div className="flex flex-col items-center h-full py-[20px] relative">
            <div
              className={cn("flex flex-col items-center my-auto gap-[49px]")}
            >
              <Button variant={"default"} onClick={processSignIn}>
                <span>S+</span>
                <span>Login</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
