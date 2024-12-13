"use client";
import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePathNavigator } from "@/route/usePathNavigator";
import { VerifyToken } from "@prisma/client";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function GuestLogin() {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [step, setStep] = useState<"email" | "code" | "selection" | "init">("init");
  console.log(step);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // const [error, setError] = useState<string | Record<string, any> | null>(null); // 에러가 객체로 들어올 수도 있는데?
  const [verifyToken, setVerifyToken] = useState<VerifyToken | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const { routeToPage } = usePathNavigator();

  const t = useTranslations("login");

  console.log("LOADING:", loading, "ERROR:", error);

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
        // alert("Email sent successfully!");
        setError("Email sent successfully!");
        const { verifyToken } = await response.json();
        setVerifyToken(verifyToken);
        setStep("code");
      } else {
        const { error, code, expiresAt, verifyToken } = await response.json();
        if (code === "EMAIL_ALREADY_SENT") {
          // alert("Verification email already sent");
          setError("Verification email already sent");
          setVerifyToken(verifyToken);
          setStep("code");
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
      console.log("result✅", result);

      if (result?.error) {
        alert("Invalid email or code");
      } else {
        alert("Login successful!");
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
      <div className="py-[20px] h-full bg-no-repeat bg-cover bg-center" style={{ backgroundImage: `url('/assets/bg_main.png')` }}>
        <div className="flex flex-col items-center">
          <span className="block font-extrabold">Galaxy AI Expert</span>

          <div className="flex flex-col items-center">
            <div className="mb-[70px]">
              <span className="block mt-[180px] font-extrabold text-[44px] text-center mb-5">{t("be a galaxy ai expert")}</span>
              <span className="block text-[30px] font-medium text-center">{t("certification")}</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"primary"} onClick={() => setStep("email")}>
                  {t("login")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("login")}</DialogTitle>
                  <DialogDescription>{t("send code your email")}</DialogDescription>
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
                      placeholder={t("email")}
                      className="w-full sm:min-w-[280px] bg-[#E5E5E5] p-3 rounded-[10px]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      required
                    />
                  </form>
                </div>
                <DialogFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant={"primary"}
                        className="text-[18px] disabled:bg-disabled"
                        type="submit"
                        form="verify-email"
                        disabled={!email || loading}
                      >
                        {t("send code")}
                      </Button>
                    </DialogTrigger>
                    {step === "code" && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("confirm your email")}</DialogTitle>
                          <DialogDescription>
                            {t.rich("magic link sent", {
                              address: (children) => (
                                <address className="inline-block">
                                  <a href={`mailto:${email}`} className="not-italic text-blue-500 ">
                                    {children}
                                  </a>
                                </address>
                              ),
                              email,
                            })}
                          </DialogDescription>
                          <div>
                            <form
                              id="verify-code"
                              onSubmit={(e) => {
                                e.preventDefault();
                                verifyCode();
                              }}
                              className="relative"
                            >
                              <input
                                placeholder="code"
                                className="w-full  bg-[#E5E5E5] p-3 rounded-[10px]"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                autoFocus
                                required
                              />
                              {/* {time < 0 ? (
                                <div className="absolute right-[10px] top-1/2 -translate-y-1/2">00:00</div>
                              ) : (
                                <div className="absolute right-[10px] top-1/2 -translate-y-1/2">00:{String(time).padStart(2, "0")}</div>
                              )} */}
                            </form>
                            {verifyToken?.expiresAt && <p>Expires At: {new Date(verifyToken.expiresAt).toLocaleString()}</p>}
                          </div>
                        </DialogHeader>
                        <DialogFooter
                          className="flex-col gap-5"
                          cancelAction={() => {
                            setCode("");
                          }}
                        >
                          <Button
                            className="text-[18px] disabled:bg-disabled"
                            variant={"primary"}
                            type="submit"
                            form="verify-code"
                            disabled={!code || loading}
                          >
                            {t("submit")}
                          </Button>
                          <div className="mx-auto">
                            <button
                              className="inline-flex text-[#4E4E4E] border-b border-b-[#4E4E4E] disabled:text-disabled disabled:border-disabled"
                              // disabled={time > 0}
                              onClick={sendEmail}
                            >
                              {t("resend code")}
                            </button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <PrivacyAndTerm />
        </div>
      </div>

      {/* dialog */}
      <AlertDialog open={!!error}>
        <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Alert</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                console.log("팝업 종료");
                setError(null);
              }}
            >
              OK
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
