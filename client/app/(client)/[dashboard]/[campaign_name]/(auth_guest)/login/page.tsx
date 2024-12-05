"use client";

import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import useTimer from "@/app/hooks/useTimer";

import { usePathNavigator } from "@/route/usePathNavigator";
import { VerifyToken } from "@prisma/client";
import { signIn } from "next-auth/react";
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

  const { time, reset, resetAndStart } = useTimer(60);

  // const [resendTimer, setResendTimer] = useState(60);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setResendTimer((timer) => timer - 1);
  //   }, 1000);

  //   if (resendTimer === 0) clearInterval(intervalId);
  //   return () => clearInterval(intervalId);
  // }, []);

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
        alert("Email sent successfully!");
        const { verifyToken } = await response.json();
        setVerifyToken(verifyToken);
        setStep("code");

        resetAndStart();
      } else {
        const { error, code, expiresAt, verifyToken } = await response.json();
        if (code === "EMAIL_ALREADY_SENT") {
          alert("Verification email already sent");
          setVerifyToken(verifyToken);
          setStep("code");
          resetAndStart();
          setExpiresAt(new Date(expiresAt));
          return;
        }
        setError(error || "Failed to send email. Please try again.");
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
    <div className="py-[20px] h-full bg-no-repeat bg-cover bg-center" style={{ backgroundImage: `url('/assets/bg_main1.png')` }}>
      <div className="flex flex-col items-center">
        <span className="block ">Galaxy AI Expert</span>

        <div className="flex flex-col items-center">
          <div className="mb-[70px]">
            <span className="block mt-[180px] font-extrabold text-[44px] text-center mb-5">Be a Galaxy AI (S24*) Expert!</span>
            <span className="block text-[30px] font-light text-center ">Certification</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"primary"} onClick={() => setStep("email")}>
                Login
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
                <DialogDescription>Log in by Send code your email.</DialogDescription>
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
                    placeholder="email"
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
                    <Button variant={"primary"} className="text-[18px] disabled:bg-disabled" type="submit" form="verify-email" disabled={!email}>
                      Send Code
                    </Button>
                  </DialogTrigger>
                  {step === "code" && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Your Email</DialogTitle>
                        <DialogDescription>
                          An email with a magic link has been sent to email@example.com Click on the link to automatically log in.
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
                            {time < 0 ? (
                              <div className="absolute right-[10px] top-1/2 -translate-y-1/2">00:00</div>
                            ) : (
                              <div className="absolute right-[10px] top-1/2 -translate-y-1/2">00:{String(time).padStart(2, "0")}</div>
                            )}
                          </form>
                        </div>
                      </DialogHeader>
                      <DialogFooter
                        className="flex-col gap-5"
                        cancelAction={() => {
                          setCode("");
                          reset();
                        }}
                      >
                        <Button className="text-[18px]" variant={"primary"} type="submit" form="verify-code" disabled={!code}>
                          Submit
                        </Button>
                        <div className="mx-auto">
                          <button
                            className="inline-flex text-[#4E4E4E] border-b border-b-[#4E4E4E] disabled:text-disabled disabled:border-disabled"
                            disabled={time > 0}
                            onClick={sendEmail}
                          >
                            Resend Code
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
        <div className="fixed bottom-7">Privacy | Term</div>
      </div>
    </div>
  );
}

// {step === "code" && (
//   <div>
//  <h2>Enter Verification Code</h2>
// <p>We have sent a verification code to your email.</p>
// <input
//   type="text"
//   placeholder="Enter the code"
//   value={code}
//   onChange={(e) => setCode(e.target.value)}
//   disabled={loading}
// />
// {verifyToken?.expiresAt && (
//   <p>
//     Expires At: {new Date(verifyToken.expiresAt).toLocaleString()}
//   </p>
// )}
// <button onClick={verifyCode} disabled={loading || !code}>
//   {loading ? "Verifying..." : "Verify Code"}
// </button>
// {expiresAt && <p>{expiresAt.toString()}</p>}
// {error && <p className="error">{error}</p>}
// </div>
// )}
