"use client";

// import { useLocalStorage } from "@/providers/local_storage_provider";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { status, data: session } = useSession();
  console.log("Home session", session);

  const sendTestEmail = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-verify-email`,
      {
        method: "POST",
        body: JSON.stringify({
          toAddress: "bluedevstorm@gmail.com",
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
  };

  const sendTestBadgeEmail = async () => {
    const badgeImageUrl =
      "https://assets-stage.samsungplus.net/certification/s24/images/badgeStage3.png";
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-verify-email`,
      {
        method: "POST",
        body: JSON.stringify({
          toAddress: "bluedevstorm@gmail.com",
          subject: "You have earned the Galaxy AI Expert Badge.",
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
                      padding: 40px;
                      border-radius: 10px;
                      text-align: center;
                      background-image: url("https://assets-stage.samsungplus.net/certification/common/images/bg_pattern_01.png"); /* 배경 패턴 URL */
                      background-repeat: repeat;
                      background-size: 50%;
                      background-position: center;
                    }
                    .header {
                      font-size: 18px;
                      font-weight: bold;
                      margin-bottom: 20px;
                    }
                    .badge-image {
                      margin: 20px auto;
                      width: 120px;
                      height: 120px;
                    }
                    .badge-title {
                      font-size: 16px;
                      font-weight: bold;
                      margin: 10px 0;
                    }
                    .date {
                      font-size: 14px;
                      margin: 5px 0 20px 0;
                      color: #555555;
                    }
                    .congratulations {
                      font-size: 14px;
                      font-weight: bold;
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
                    <img
                      src="${badgeImageUrl}"
                      alt="Galaxy AI Expert Badge"
                      class="badge-image"
                    />
                    <div class="congratulations">
                      Congratulations!<br />
                      You have earned the Galaxy AI Expert Badge.
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
  };

  if (session) {
    return (
      <>
        :) Signed in as {session.user?.email}
        <br />
        <button onClick={() => signOut()}>Sign out</button>
        <br />
        <br />
        <button
          onClick={() => {
            sendTestEmail();
          }}
        >
          Send Email
        </button>
        <br />
        <br />
        <button
          onClick={() => {
            sendTestBadgeEmail();
          }}
        >
          Send Badge Email
        </button>
      </>
    );
  }

  const processSignIn = async () => {
    const result = await signIn("sumtotal");
    console.log("result", result);
  };

  return (
    <div>
      <h1>Sumtotal Test Login</h1>
      <button
        onClick={() => {
          processSignIn();
        }}
        disabled={status === "loading"}
      >
        Sign in with Sumtotal
      </button>
      <br />
      <br />
      <button
        onClick={() => {
          sendTestEmail();
        }}
      >
        Send Email
      </button>
      {status === "loading" && <p>Loading...</p>}
    </div>
  );
}
