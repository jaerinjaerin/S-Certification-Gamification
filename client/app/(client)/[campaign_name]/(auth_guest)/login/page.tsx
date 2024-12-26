"use client";
import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, fixedClass, formatToMMSS } from "@/lib/utils";
import { VerifyToken } from "@prisma/client";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useCountdown } from "usehooks-ts";

export default function GuestLogin() {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [step, setStep] = useState<"email" | "code" | "selection" | "init">(
    "init"
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState<VerifyToken | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [successSendEmail, setSuccessSendEmail] = useState<string | null>(null);

  const [countStart, setCountStart] = useState<number>(0);
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({ countStart });

  const translation = useTranslations();

  useEffect(() => {
    if (expiresAt) {
      const now = new Date();
      const diffInSeconds = Math.max(
        0,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      );

      setCountStart(diffInSeconds);
      resetCountdown();
      startCountdown();
    }
  }, [expiresAt, resetCountdown]);

  const sendEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-verify-email`,
        {
          method: "POST",
          body: JSON.stringify({
            toAddress: email,
            subject: "Autherntication Code for Galaxy AI Expert.",
            bodyHtml: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background-color: #000000;
                    color: #333333;
                  }
                  .email-container {
                    max-width: 840px;
                    width: 100%;
                    height: 414px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 80px;
                    border-radius: 10px;
                    text-align: center;
                    background-image: url("https://assets-stage.samsungplus.net/certification/common/images/bg_pattern_01.png");
                    background-repeat: repeat;
                    background-size: 50%;
                    background-position: center;
                  }
                  .header {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 20px;
                  }
                  .code {
                    font-size: 48px;
                    font-weight: bold;
                    margin: 20px 0;
                  }
                  .message {
                    font-size: 14px;
                    color: #555555;
                    margin-top: 20px;
                  }
                  .footer {
                    font-size: 12px;
                    color: #aaaaaa;
                    margin-top: 30px;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div class="email-container">
                  <div class="header">S+ Galaxy AI Expert(Paradigm)</div>
                  <div class="code">
                    $CODE$
                  </div>
                  <div class="message">
                    Please enter this code on the verification page to complete the
                    process.<br />
                    For your security, this code will expire in [time limit, e.g., 5
                    minutes].
                  </div>
                </div>
                <div class="footer">
                  This message was automatically delivered by Samsung+ service. Do not reply
                  to this message.<br />
                  Copyright © 2024 SAMSUNG all rights reserved.
                </div>
              </body>
            </html>
          `,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const { code, expiresAt, verifyToken } = data;
        console.log("처음 코드 받았을때 verifyToken", verifyToken, data);

        if (code === "EMAIL_SENT") {
          setSuccessSendEmail("Email sent successfully!");
          setVerifyToken(verifyToken);
          setExpiresAt(new Date(expiresAt));
          startCountdown();
        } else {
          setError("Failed to send email. Please try again.");
        }
      } else {
        const data = await response.json();
        console.log("data", data);
        const { code, expiresAt, verifyToken } = data;
        if (code === "EMAIL_ALREADY_SENT") {
          setSuccessSendEmail("Verification email already sent");
          setVerifyToken(verifyToken);

          setExpiresAt(new Date(expiresAt));
          startCountdown();
          return;
        }

        // 에러가 발생했을 경우
        // setError(error || "Failed to send email. Please try again.");
        setError("Failed to send email. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/verify-code`,
        {
          method: "POST",
          body: JSON.stringify({ email, code }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        const { code, error } = data;
        if (code === "EMAIL_NOT_SENT") {
          setError("Verification email not sent");
          return;
        }

        if (code === "EMAIL_EXPIRED") {
          setError("Verification email expired");
          return;
        }

        if (code === "CODE_NOT_MATCH") {
          setError("Verification code does not match");
          return;
        }

        alert("Failed to verify code");
        return;
      }

      const data = await response.json();
      const result = await signIn("credentials", {
        email,
        code,
        // callbackUrl: "/intro",
      });

      console.log("result", result);
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  console.log(
    "process.env.NEXT_PUBLIC_BASE_PATH",
    process.env.NEXT_PUBLIC_BASE_PATH
  );

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
          <source
            src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/videos/bg.mp4`}
            type="video/mp4"
          />
          <source
            src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/videos/bg.webm`}
            type="video/webm"
          />
        </video>

        <div className="flex flex-col items-center h-full relative z-10 py-5">
          <span className="block font-extrabold">
            {translation("Main.galaxy_ai_expert")}
          </span>

          <div className="flex flex-col items-center my-auto">
            <div className="mb-[70px]">
              <span className="block font-extrabold text-[44px] text-center mb-5">
                {translation("Main.be_a_galaxy_ai_expert")}
              </span>
              <span className="block text-[30px] font-medium text-center">
                {translation("Main.certification")}
              </span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"primary"} onClick={() => setStep("email")}>
                  {translation("Main.login")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{translation("Main.login")}</DialogTitle>
                  <DialogDescription>
                    {translation("Login_popup.login_by_send_code")}
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <form
                    id="verify-email"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendEmail();
                    }}
                  >
                    <input
                      placeholder={translation("Login_popup.email")}
                      inputMode="email"
                      className="w-full sm:min-w-[280px] bg-[#E5E5E5] p-3 rounded-[10px]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </form>
                </div>
                <DialogFooter>
                  <Button
                    variant={"primary"}
                    className="text-[18px] disabled:bg-disabled"
                    type="submit"
                    form="verify-email"
                    disabled={!email || loading}
                    onClick={() => stopCountdown()}
                  >
                    {loading
                      ? "sending..."
                      : `${translation("Login_popup.send_code")}`}
                  </Button>
                  <DialogClose className="absolute top-5 right-5">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <PrivacyAndTerm />
        </div>
      </div>

      {/* error alert dialog */}
      <AlertDialog open={!!error}>
        <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Alert</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setError(null);
              }}
            >
              OK
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* success */}
      <AlertDialog open={!!successSendEmail}>
        <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>{successSendEmail}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button
                variant={"primary"}
                onClick={() => {
                  setSuccessSendEmail(null);
                  setStep("code");
                  // resetCountdown();
                  // startCountdown();
                }}
              >
                OK
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={step === "code"}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {translation("Login_popup.confirm_your_email")}
            </DialogTitle>
            <DialogDescription>
              {translation.rich("Login_popup.send_magic_link", {
                address: (children) => (
                  <span className="text-blue-500">{children}</span>
                ),
                email,
              })}
            </DialogDescription>
          </DialogHeader>
          <div>
            <form
              id="verify-code"
              onSubmit={(e) => {
                console.log("verify code");
                e.preventDefault();
              }}
              className="relative"
            >
              <input
                placeholder="code"
                inputMode="numeric"
                className="w-full  bg-[#E5E5E5] p-3 rounded-[10px]"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <div className="absolute right-[10px] top-1/2 -translate-y-1/2">
                {formatToMMSS(count)}
              </div>
            </form>
            {/* {verifyToken?.expiresAt && (
              <p>
                Expires At: {new Date(verifyToken.expiresAt).toLocaleString()}
              </p>
            )} */}
          </div>
          <DialogFooter
            className="flex-col items-center gap-5"
            onClick={() => {
              setCode("");
            }}
          >
            <Button
              className="text-[18px] disabled:bg-disabled"
              variant={"primary"}
              type="submit"
              form="verify-code"
              disabled={!code || loading}
              onClick={verifyCode}
            >
              {loading
                ? "verifying..."
                : `${translation("Login_popup.submit")}`}
            </Button>
            <div className="mx-auto">
              <button
                className="inline-flex text-[#4E4E4E] border-b border-b-[#4E4E4E] disabled:text-disabled disabled:border-disabled"
                onClick={sendEmail}
                disabled
              >
                {translation("Login_popup.resend_code")}
              </button>
            </div>
            <DialogClose
              className="absolute top-5 right-5"
              onClick={() => setStep("email")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
