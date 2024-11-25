"use client";

import { usePathNavigator } from "@/route/usePathNavigator";
import { VerifyToken } from "@prisma/client";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";

export default function GuestLogin() {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [step, setStep] = useState<"email" | "code" | "selection">("email");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState<VerifyToken | null>(null);
  const { data: session } = useSession();
  const { routeToPage } = usePathNavigator();

  const sendEmail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toAddress: email }),
      });

      if (response.ok) {
        alert("Email sent successfully!");
        const { verifyToken } = await response.json();
        setVerifyToken(verifyToken);
        setStep("code");
      } else {
        const { error, code, retryAfter, verifyToken } = await response.json();
        if (code === "EMAIL_ALREADY_SENT") {
          alert("Verification email already sent");
          setVerifyToken(verifyToken);
          setStep("code");
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
    <div className="container">
      {step === "email" && (
        <div>
          <h2>Email Verification</h2>
          <p>Enter your email to receive a verification code.</p>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <button onClick={sendEmail} disabled={loading || !email}>
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {step === "code" && (
        <div>
          <h2>Enter Verification Code</h2>
          <p>We have sent a verification code to your email.</p>
          <input
            type="text"
            placeholder="Enter the code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
          {verifyToken?.expiresAt && (
            <p>
              Expires At: {new Date(verifyToken.expiresAt).toLocaleString()}
            </p>
          )}
          <button onClick={verifyCode} disabled={loading || !code}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
}
