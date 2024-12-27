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
import { formatToMMSS } from "@/lib/utils";
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

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
      setError(translation("email_failed"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-verify-email`,
        {
          method: "POST",
          body: JSON.stringify({
            toAddress: email,
            subject: `${translation("email_title")}`,
            bodyHtml: `<!DOCTYPE html>
                        <html style="font-weight: 400">
                          <head style="font-weight: 400">
                            <meta charset="utf-8" style="font-weight: 400" />
                            <meta
                              name="viewport"
                              content="width=device-width, initial-scale=1"
                              style="font-weight: 400"
                            />

                            <!-- TODO: 삼성폰트로 교체 -->
                            <!-- <style type="text/css" style="font-weight: 400">
                              @import url(https://fonts.googleapis.com/css?family=Lato:400,700);
                            </style> -->

                            <style type="text/css" style="font-weight: 400"></style>
                          </head>
                          <body
                            style="
                              font-weight: 400;
                              width: 100%;
                              min-width: 100svw;
                              font-size: 16px;
                              font-family: 'Lato', 'Helvetica Neue', helvetica, sans-serif;
                              background-color: #fff;
                              color: #2f2936;
                              -webkit-font-smoothing: antialiased;
                              margin: 0;
                              padding: 0;
                              background-color: #000;
                            "
                          >
                            <div
                              class="preheader"
                              style="
                                font-weight: 400;
                                display: none;
                                font-size: 0;
                                max-height: 0;
                                line-height: 0;
                                mso-hide: all;
                                padding: 0;
                              "
                            >
                              Authentication Code for Galaxy AI Expert.
                            </div>
                            <table
                              style="
                                font-weight: 400;
                                max-width: 840px;
                                width: 100%;
                                border-collapse: separate;
                                font-size: 16px;
                                font-family: 'Lato', 'Helvetica Neue', helvetica, sans-serif;
                                background-color: #fff;
                                color: #2f2936;
                                -webkit-font-smoothing: antialiased;
                                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                                border-radius: 4px;
                                border: 1px solid #c7d0d4;
                                border-spacing: 0;
                                margin: 30px auto;
                                padding: 40px;
                                background-image: url(https://assets-stage.samsungplus.net/certification/common/images/bg_pattern_01.png);
                                background-size: contain;
                              "
                            >
                              <tr style="font-weight: 400">
                                <td style="font-weight: 400; text-align: center; margin: 0; padding: 0">
                                  <div
                                    class="header"
                                    style="
                                      font-weight: 400;
                                      font-size: 14px;
                                      border-bottom: 1px solid #dee7eb;
                                      padding: 23px 0;
                                    "
                                  >
                                    <div
                                      class="container"
                                      style="
                                        font-weight: 400;
                                        text-align: left;
                                        margin: 0 auto;
                                        padding: 0 20px;
                                      "
                                    >
                                      <!-- 첫번째 타이틀 -->
                                      <div
                                        style="
                                          font-weight: 400;
                                          display: inline-block;
                                          width: 100%;
                                          align-items: center;
                                        "
                                      >
                                        <h1
                                          style="
                                            font-weight: 500;
                                            float: left;
                                            font-size: 18px;
                                            line-height: 42px;
                                            color: #000;
                                            letter-spacing: -1px;
                                            margin: 0;
                                            padding: 0;
                                          "
                                        >
                                          S+ ${translation("galaxy_ai_expert")}
                                        </h1>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr style="font-weight: 400">
                                <td style="font-weight: 400; text-align: center; margin: 0; padding: 0">
                                  <div
                                    class="container"
                                    style="
                                      max-width: 600px;
                                      text-align: left;
                                      margin: 70px auto;
                                      padding: 0 20px;
                                    "
                                  >
                                    <div
                                      class="inner"
                                      style="
                                        font-weight: 400;
                                        background-color: transparent;
                                        padding: 30px 0 20px;
                                      "
                                    >
                                      <h2
                                        style="
                                          font-weight: 700;
                                          font-size: 54px;
                                          margin: 0 0 4px;
                                          text-align: center;
                                        "
                                      >
                                        $CODE$
                                      </h2>
                                    </div>
                                  </div>

                                  <div
                                    class="container"
                                    style="
                                      font-weight: 400;
                                      max-width: 600px;
                                      text-align: left;
                                      padding: 0 20px;
                                    "
                                  >
                                    <div class="footer" style="font-weight: 400; line-height: 2">
                                      <span
                                        style="font-weight: 500; color: #687276; text-decoration: none"
                                      >
                                        ${translation(
                                          "email_verify_code_description_1"
                                        )}
                                      </span>
                                      <span
                                        style="font-weight: 500; color: #687276; text-decoration: none"
                                      >
                                        ${translation(
                                          "email_verify_code_description_2"
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              style="
                                font-weight: 400;
                                max-width: 840px;
                                width: 100%;
                                border-collapse: separate;
                                font-size: 16px;
                                font-family: 'Lato', 'Helvetica Neue', helvetica, sans-serif;
                                color: white;
                                -webkit-font-smoothing: antialiased;
                                border-spacing: 0;
                                margin: 30px auto;
                                padding: 0 40px;
                              "
                            >
                              <tr style="font-weight: 400">
                                <td style="font-weight: 400; text-align: center; margin: 0; padding: 0">
                                  <div
                                    class="container"
                                    style="
                                      font-weight: 400;

                                      text-align: left;
                                      padding: 0 20px;
                                    "
                                  >
                                    <div
                                      class="footer"
                                      style="font-weight: 400; line-height: 2; text-align: center"
                                    >
                                      <span
                                        style="
                                          font-weight: 500;
                                          color: #989898;
                                          text-decoration: none;
                                          display: block;
                                        "
                                      >
                                        ${translation(
                                          "email_badge_description_4"
                                        )}
                                      </span>
                                      <span
                                        style="font-weight: 500; color: white; text-decoration: none"
                                      >
                                        Copyright ⓒ 2024 SAMSUNG all rights reserved.
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
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
          setSuccessSendEmail(translation("email_success"));
          setVerifyToken(verifyToken);
          setExpiresAt(new Date(expiresAt));
          startCountdown();
        } else {
          setError(translation("email_failed"));
        }
      } else {
        const data = await response.json();
        console.log("data", data);
        const { code, expiresAt, verifyToken, retryAfter } = data;
        if (code === "EMAIL_ALREADY_SENT") {
          setSuccessSendEmail(translation("email_already_sent"));
          setVerifyToken(verifyToken);

          setExpiresAt(new Date(retryAfter));
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
        const { code, error } = data;
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

      const data = await response.json();
      const result = await signIn("credentials", {
        email,
        code,
        // callbackUrl: "/intro",
      });

      console.log("result", result);
    } catch (err) {
      console.error(err);
      alert(translation("unexpected_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <video
          className="w-full h-svh object-fill "
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

        <div className="flex flex-col items-center size-full absolute top-0 z-10 py-5">
          <span className="block font-extrabold">
            {translation("galaxy_ai_expert")}
          </span>

          <div className="m-auto">
            <div
              className="font-extrabold text-[44px] text-center mb-5 hyphens-auto break-words whitespace-normal"
              style={{
                wordBreak: "break-word",
              }}
            >
              {translation("be_a_galaxy_ai_expert")}
            </div>
            <span className="block text-[30px] font-medium text-center">
              {translation("certification")}
            </span>
            <div className="text-center mt-[70px]">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant={"primary"}
                    onClick={() => {
                      setStep("email");
                    }}
                  >
                    {translation("login")}
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
                    >
                      {translation("send_code")}
                    </Button>
                    <DialogClose className="absolute top-5 right-5">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
              {translation("ok")}
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
                {translation("ok")}
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
              {translation.rich("send_magic_link", {
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
              {translation("submit")}
            </Button>
            <div className="mx-auto">
              <button
                className="inline-flex text-[#4E4E4E] border-b border-b-[#4E4E4E] disabled:text-disabled disabled:border-disabled"
                onClick={sendEmail}
                disabled={count > 0}
              >
                {translation("resend_code")}
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
