"use client";

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
import useGAPageView from "@/core/monitoring/ga/usePageView";
import useCheckLocale from "@/hooks/useCheckLocale";
import { cn, formatToMMSS } from "@/utils/utils";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { AutoTextSize } from "auto-text-size";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useCountdown } from "usehooks-ts";

export default function GuestLogin({
  params,
}: {
  params: { campaign_name: string };
}) {
  useGAPageView();

  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [step, setStep] = useState<"email" | "code" | "selection" | "init">(
    "init"
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const [_, setVerifyToken] = useState<VerifyToken | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [successSendEmail, setSuccessSendEmail] = useState<string | null>(null);

  const [countStart, setCountStart] = useState<number>(0);
  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart,
  });

  const translation = useTranslations();
  const { isArabic } = useCheckLocale();

  const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) ? true : false;
  };

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
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/send-verify-email`,
        {
          method: "POST",
          body: JSON.stringify({
            toAddress: email,
            subject: `${translation("email_title")}`,
            bodyHtml: `
            <!DOCTYPE html>
            <html style="font-weight: 400">
              <head style="font-weight: 400">
                <meta charset="utf-8" style="font-weight: 400" />
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1"
                  style="font-weight: 400"
                />

                <style type="text/css" style="font-weight: 400">
                  @import url(https://assets.samsungplus.net/certification/s25/fonts/sharpSans/SamsungSharpSans-Regular.woff);

                  .colored-black {
                    color:#ffffff;
                    mix-blend-mode:difference;
                  }
                </style>
              </head>
              <body
                style="
                  font-weight: 400;
                  width: 100%;
                  font-size: 16px;
                  font-family: 'SamsungSharpSans', sans-serif;
                  -webkit-font-smoothing: antialiased;
                  margin: 0;
                  padding: 0;
                  background-color: #000000;
                  box-sizing: border-box;
                "
              >
                <table
                  style="
                    font-weight: 400;
                    width: 100%;
                    border-collapse: separate;
                    font-size: 16px;
                    font-family: 'SamsungSharpSans' sans-serif;
                    background-image: url(https://assets.samsungplus.net/certification/common/images/bg_pattern_01.jpg);
                    -webkit-font-smoothing: antialiased;
                    max-width: 800px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                    border: 1px solid #c7d0d4;
                    border-spacing: 0;
                    margin: 15px auto;
                    padding: 0;
                  "
                >
                  <tr style="font-weight: 400">
                    <td style="font-weight: 400; text-align: center; margin: 0; padding: 0;">
                      <div style="font-weight: 400; font-size: 14px; padding: 23px 0">
                        <div
                          style="
                            font-weight: 400;
                            max-width: 600px;
                            text-align: left;
                            margin: 0 auto;
                            padding: 0 20px;
                          "
                        >
                          <div
                            style="
                              font-weight: 600;
                              display: inline-block;
                              width: 100%;
                              align-items: center;
                            "
                          >
                            <h1
                              class="colored-black"
                              style="
                                font-weight: 700;
                                float: left;
                                font-size: 16px;
                                line-height: 42px;
                                letter-spacing: -1px;
                                margin: 0;
                                padding: 0;
                              "
                            >S+ ${translation("galaxy_ai_expert")}</h1>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr style="font-weight: 400">
                    <td style="font-weight: 400; text-align: center; margin: 0; padding: 0;">
                      <div
                        style="
                          font-weight: 400;
                          max-width: 600px;
                          text-align: left;
                          margin: 0 auto;
                          padding: 0 20px;
                        "
                      >
                        <div style="font-weight: 400; padding: 30px 0 20px">
                          <h2
                            class="colored-black"
                            style="
                              font-weight: 700;
                              font-size: 54px;
                              margin: 70px 0;
                              text-align: center;
                            "
                          >
                            $CODE$
                          </h2>

                          <div
                            style="font-weight: 400; margin-bottom: 30px; "
                          >
                            <h3
                              class="title"
                              style="
                                font-weight: 700;
                                font-size: 18px;
                                margin: 0 0 15px;
                              "
                            ></h3>
                            <p
                              class="colored-black"
                              style="
                                font-weight: normal;
                                font-family: 'SamsungSharpSans' sans-serif;
                                font-size: 14px;
                                white-space: pre-wrap;
                                border-radius: 4px;
                                overflow-wrap: break-word;
                                word-wrap: break-word;
                                padding-bottom:5px;
                              "
                            >${translation(
                              "email_verify_code_description_1"
                            )}</p>
                            <p
                              class="colored-black"
                              style="
                                font-weight: normal;
                                font-family: 'SamsungSharpSans' sans-serif;
                                font-size: 14px;
                                white-space: pre-wrap;
                                border-radius: 4px;
                                overflow-wrap: break-word;
                                word-wrap: break-word;
                              "
                            >${translation(
                              "email_verify_code_description_2"
                            )}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr style="font-weight: 400">
                    <td
                      style="
                        font-weight: 400;
                        text-align: center;
                        margin: 0;
                        padding: 0;
                        background-color: #121212;
                        color: #ffffff;
                      "
                    >
                      <div style="font-weight: 400; font-size: 14px; padding: 23px 0">
                        <div
                          style="
                            font-weight: 400;
                            max-width: 600px;
                            text-align: left;
                            margin: 0 auto;
                            padding: 0 20px;
                          "
                        >
                          <div
                            style="
                              font-weight: 400;
                              display: inline-block;
                              width: 100%;
                              align-items: center;
                            "
                          >
                            <p
                              style="
                                font-weight: normal;
                                font-family: 'SamsungSharpSans' sans-serif;
                                font-size: 14px;
                                white-space: pre-wrap;
                                border-radius: 4px;
                                overflow-wrap: break-word;
                                word-wrap: break-word;
                                margin: 0 0 15px;
                              "
                            >${translation("email_badge_description_4")}</p>
                            <p
                              style="
                                font-weight: normal;
                                font-family: 'SamsungSharpSans' sans-serif;
                                font-size: 14px;
                                white-space: pre-wrap;
                                border-radius: 4px;
                                overflow-wrap: break-word;
                                word-wrap: break-word;
                                margin: 0 0 15px;
                              "
                            >Copyright ⓒ 2024 SAMSUNG all rights reserved.</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </body>
            </html>`,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const { code, expiresAt } = data;
        // console.log("처음 코드 받았을때 verifyToken", verifyToken, data);

        if (code === "EMAIL_SENT") {
          setSuccessSendEmail(translation("email_success"));
          // setVerifyToken(verifyToken);
          setExpiresAt(new Date(expiresAt));
          startCountdown();
        } else {
          setError(translation("email_failed"));
        }
      } else {
        const data = await response.json();
        // console.log("data", data);
        const { code, expiresAt } = data;
        if (code === "EMAIL_ALREADY_SENT") {
          setSuccessSendEmail(translation("email_already_sent"));
          // setVerifyToken(verifyToken);

          setExpiresAt(new Date(expiresAt));
          startCountdown();
          return;
        }

        setError(translation("email_failed"));
      }
    } catch (err) {
      console.error(err);
      setError(translation("unexpected_error"));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError(null);

    const regex = /^\d{3,}$/;
    if (!regex.test(code)) {
      setError(translation("code_error"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/verify-code`,
        {
          method: "POST",
          body: JSON.stringify({ email, code }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        const { code } = data;
        if (code === "EMAIL_NOT_SENT") {
          setError(translation("email_not_sent"));
          return;
        }

        if (code === "EMAIL_EXPIRED") {
          setError(translation("email_expired"));
          return;
        }

        if (code === "CODE_NOT_MATCH") {
          setError(translation("code_not_match"));
          return;
        }

        alert(translation("verify_code_failed"));
        return;
      }

      await response.json();
      await signIn("credentials", {
        email,
        code,
        callbackUrl: `/${params.campaign_name}/register`,
      });

      // console.log("result", result);
    } catch (err) {
      console.error(err);
      alert(translation("unexpected_error"));
    } finally {
      setLoading(false);
    }
  };

  const convertMessageFormat = (searchKey: string) => {
    const searchMessage = translation.rich(searchKey, {
      address: (children) => (
        <>
          <span className="text-blue-500">{children}</span>
          <br />
        </>
      ),
      email,
    });

    const lastArray = React.Children.toArray(searchMessage).at(-1) as string;

    return (
      <>
        {React.Children.toArray(searchMessage).slice(0, 2)}
        <span>{lastArray.replace(".", "")}</span>
      </>
    );
  };

  return (
    <>
      <div className="relative">
        {/* <video
          className="object-fill w-full h-svh "
          autoPlay
          loop
          muted
          playsInline
        >
          <source
            src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/videos/bg.mp4`}
            type="video/mp4"
          />
          <source
            src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/videos/bg.webm`}
            type="video/webm"
          />
        </video> */}

        <div
          className="object-fill w-full h-svh"
          style={{
            backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        <div className="absolute top-0 z-10 flex flex-col items-center py-5 size-full">
          <span className="block text-lg font-bold">
            {translation("galaxy_ai_expert")}
          </span>

          <div className="m-auto flex flex-col gap-[49px]">
            <div className="font-bold text-center text-4xl/normal sm:text-5xl/normal text-balance px-[20px] max-w-[420px] min-w-[280px] w-full h-[200px] !items-center">
              <AutoTextSize mode="box">
                {translation("be_a_galaxy_ai_expert")}
              </AutoTextSize>
            </div>

            <div className="text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className={cn(isArabic && "flex-row-reverse")}
                    variant={"primary"}
                    onClick={() => {
                      setStep("email");
                    }}
                  >
                    <span>{translation("login")}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  onOpenAutoFocus={(event) => {
                    event.preventDefault();
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>{translation("login")}</DialogTitle>
                    <DialogDescription>
                      {translation("login_by_send_code")}
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
                        placeholder={translation("email")}
                        inputMode="email"
                        className={cn(
                          "w-full sm:min-w-[280px] bg-[#E5E5E5] p-3 rounded-[10px] font-one font-medium text-base",
                          isArabic && "text-right"
                        )}
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
                      disabled={!email || loading || !isValidEmail(email)}
                    >
                      <span>{translation("send_code")}</span>
                    </Button>
                    <DialogClose className="absolute top-5 right-5">
                      <X />
                      <span className="sr-only">Close</span>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* error alert dialog */}
      <AlertDialog open={!!error}>
        <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle></AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setError(null);
              }}
            >
              <span>{translation("ok")}</span>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* success */}
      <AlertDialog open={!!successSendEmail}>
        <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle aria-hidden className="hidden">
              Alert
            </AlertDialogTitle>
            <AlertDialogDescription>{successSendEmail}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button
                variant={"primary"}
                onClick={() => {
                  setSuccessSendEmail(null);
                  setStep("code");
                }}
              >
                <span>{translation("ok")}</span>
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={step === "code"}>
        <DialogContent
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{translation("confirm_your_email")}</DialogTitle>
            <DialogDescription>
              {convertMessageFormat("send_magic_link")}
            </DialogDescription>
          </DialogHeader>
          <div>
            <form
              id="verify-code"
              onSubmit={(e) => {
                // console.log("verify code");
                e.preventDefault();
              }}
              className="relative font-medium font-one w-full bg-[#E5E5E5] rounded-[10px] p-1"
            >
              <input
                placeholder="code"
                inputMode="numeric"
                className={cn(
                  "bg-[#E5E5E5] rounded-[10px] w-[70%] sm:w-[80%] p-2",
                  isArabic && "text-right translate-x-[57px]"
                )}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
                required
              />
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2",
                  isArabic ? "left-[10px]" : "right-[10px]"
                )}
              >
                {formatToMMSS(count)}
              </div>
            </form>
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
              onClick={() => {
                verifyCode();
              }}
            >
              <span>{translation("submit")}</span>
            </Button>
            <div className="mx-auto">
              <button
                className="inline-flex text-[#4E4E4E] border-b border-b-[#4E4E4E] disabled:text-disabled disabled:border-disabled"
                onClick={sendEmail}
                disabled={count > 480}
              >
                {translation("resend_code")}
              </button>
            </div>
            <DialogClose
              className="absolute top-5 right-5"
              onClick={() => setStep("email")}
            >
              <X />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
