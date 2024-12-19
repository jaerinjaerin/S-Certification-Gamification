"use client";
import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
import { cn, fixedClass } from "@/lib/utils";
import { usePathNavigator } from "@/route/usePathNavigator";
import { VerifyToken } from "@prisma/client";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function GuestLogin() {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [step, setStep] = useState<"email" | "code" | "selection" | "init">("init");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState<VerifyToken | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const { routeToPage } = usePathNavigator();
  const [successSendEmail, setSuccessSendEmail] = useState<string | null>(null);
  // const [count, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({ countStart: 60 });
  const translation = useTranslations("login");

  console.log(verifyToken);
  console.log("loading", loading, error, expiresAt);

  const sendEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-verify-email", {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toAddress: email }),
      });

      if (response.ok) {
        setSuccessSendEmail("Email sent successfully!");
        const { verifyToken } = await response.json();
        console.log("처음 코드 받았을때 verifyToken", verifyToken);
        setVerifyToken(verifyToken);
      } else {
        const { error, code, expiresAt, verifyToken } = await response.json();
        if (code === "EMAIL_ALREADY_SENT") {
          setSuccessSendEmail("Verification email already sent");
          setVerifyToken(verifyToken);

          setExpiresAt(new Date(expiresAt));
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
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        code,
        // callbackUrl: "/intro",
      });

      if (result?.error) {
        alert("Invalid email or code");
      } else {
        routeToPage("/register");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="py-[20px] bg-no-repeat bg-cover bg-center h-svh ">
        <div className={cn(fixedClass, "top-0 bottom-0 bg-cover bg-center ")} style={{ backgroundImage: `url('/assets/bg_main.png')` }} />

        <div className="flex flex-col items-center h-full relative z-10">
          <span className="block font-extrabold">Galaxy AI Expert</span>

          <div className="flex flex-col items-center my-auto">
            <div className="mb-[70px]">
              <span className="block font-extrabold text-[44px] text-center mb-5">{translation("be a galaxy ai expert")}</span>
              <span className="block text-[30px] font-medium text-center">{translation("certification")}</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"primary"} onClick={() => setStep("email")}>
                  {translation("login")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{translation("login")}</DialogTitle>
                  <DialogDescription>{translation("send code your email")}</DialogDescription>
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
                      autoFocus
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
                    {loading ? "sending..." : `${translation("send code")}`}
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
            <DialogTitle>{translation("confirm your email")}</DialogTitle>
            <DialogDescription>
              {translation.rich("magic link sent", {
                address: (children) => <span className="text-blue-500">{children}</span>,
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
                autoFocus
                required
              />
              {/* <div className="absolute right-[10px] top-1/2 -translate-y-1/2">{formatToMMSS(count)}</div> */}
            </form>
            {verifyToken?.expiresAt && <p>Expires At: {new Date(verifyToken.expiresAt).toLocaleString()}</p>}
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
              {loading ? "verifying..." : `${translation("submit")}`}
            </Button>
            <div className="mx-auto">
              <button
                className="inline-flex text-[#4E4E4E] border-b border-b-[#4E4E4E] disabled:text-disabled disabled:border-disabled"
                onClick={sendEmail}
                disabled
              >
                {translation("resend code")}
              </button>
            </div>
            <DialogClose className="absolute top-5 right-5" onClick={() => setStep("email")}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
