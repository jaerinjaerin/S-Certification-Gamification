"use client";

// UI Components
import { Button } from "@/components/ui/button";
import CodeInputDialog from "@/components/login/code-input-dialog";
import EmailInputDialog from "@/components/login/email-input-dialog";
import { ResultAlertDialog } from "@/components/dialog/result-alert-dialog";

// Hooks
import useCheckLocale from "@/hooks/useCheckLocale";
import useGAPageView from "@/core/monitoring/ga/usePageView";
import { useCountdown } from "usehooks-ts";

// Utils
import { cn } from "@/utils/utils";
import { AutoTextSize } from "auto-text-size";
import { getLoginEmailTemplete } from "@/templete/email";

// Types
import { LoginAction, LoginState } from "@/types/pages/login/types";

import { useTranslations } from "next-intl";
import React, { useEffect, useReducer } from "react";

const initialState: LoginState = {
  email: "",
  code: "",
  step: "init",
  loading: false,
  error: null,
  expiresAt: null,
  successSendEmail: null,
  countStart: 0,
};

function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_CODE":
      return { ...state, code: action.payload };
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_EXPIRES_AT":
      return { ...state, expiresAt: action.payload };
    case "SET_SUCCESS_SEND_EMAIL":
      return { ...state, successSendEmail: action.payload };
    case "SET_COUNT_START":
      return { ...state, countStart: action.payload };
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
}

export default function GuestLogin({ params }: { params: { campaign_name: string } }) {
  useGAPageView();

  const [state, dispatch] = useReducer(loginReducer, initialState);

  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart: state.countStart,
  });

  const translation = useTranslations();
  const { isArabic } = useCheckLocale();

  useEffect(() => {
    if (state.expiresAt) {
      const now = new Date();
      const diffInSeconds = Math.max(0, Math.floor((state.expiresAt.getTime() - now.getTime()) / 1000));

      // setCountStart(diffInSeconds);
      dispatch({ type: "SET_COUNT_START", payload: diffInSeconds });
      resetCountdown();
      startCountdown();
    }
  }, [state.expiresAt, resetCountdown]);

  const sendEmail = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/send-verify-email`, {
        method: "POST",
        body: JSON.stringify({
          toAddress: state.email,
          subject: `${translation("email_title")}`,
          bodyHtml: getLoginEmailTemplete(
            translation("galaxy_ai_expert"),
            translation("email_verify_code_description_1"),
            translation("email_verify_code_description_2"),
            translation("email_badge_description_4")
          ),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { code, expiresAt } = data;

        if (code === "EMAIL_SENT") {
          dispatch({ type: "SET_SUCCESS_SEND_EMAIL", payload: translation("email_success") });
          dispatch({ type: "SET_EXPIRES_AT", payload: new Date(expiresAt) });
          startCountdown();
        } else {
          dispatch({ type: "SET_ERROR", payload: translation("email_failed") });
        }
      } else {
        const data = await response.json();
        const { code, expiresAt } = data;

        if (code === "EMAIL_ALREADY_SENT") {
          dispatch({ type: "SET_SUCCESS_SEND_EMAIL", payload: translation("email_already_sent") });
          dispatch({ type: "SET_EXPIRES_AT", payload: new Date(expiresAt) });
          startCountdown();
          return;
        }

        dispatch({ type: "SET_ERROR", payload: translation("email_failed") });
      }
    } catch (err) {
      console.error(err);
      // setError(translation("unexpected_error"));
      dispatch({ type: "SET_ERROR", payload: translation("unexpected_error") });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <>
      <div
        className="flex flex-col items-center py-5 min-h-svh"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/common/images/main_bg2.jpg')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <span className="block text-lg font-bold">{translation("galaxy_ai_expert")}</span>

        <div className="my-auto w-full flex flex-col gap-[49px]">
          <div className="font-bold text-center text-4xl/normal sm:text-5xl/normal text-balance px-[20px] max-w-[420px] min-w-[280px] w-full h-[200px] !items-center">
            <AutoTextSize mode="box">{translation("be_a_galaxy_ai_expert")}</AutoTextSize>
          </div>

          <div className="text-center">
            <EmailInputDialog state={state} dispatch={dispatch} sendEmail={sendEmail}>
              <Button
                className={cn(isArabic && "flex-row-reverse")}
                variant={"primary"}
                onClick={() => {
                  dispatch({ type: "SET_STEP", payload: "email" });
                }}
              >
                <span>{translation("login")}</span>
              </Button>
            </EmailInputDialog>
          </div>
        </div>
      </div>

      <CodeInputDialog state={state} dispatch={dispatch} isArabic={isArabic} count={count} path={params.campaign_name} sendEmail={sendEmail} />

      {/* {error} */}
      <ResultAlertDialog
        open={!!state.error}
        description={state.error}
        onConfirm={() => {
          dispatch({ type: "SET_ERROR", payload: null });
        }}
        confirmText={translation("ok")}
      />

      {/* {success} */}
      <ResultAlertDialog
        open={!!state.successSendEmail}
        description={state.successSendEmail}
        onConfirm={() => {
          dispatch({ type: "SET_SUCCESS_SEND_EMAIL", payload: null });
          dispatch({ type: "SET_STEP", payload: "code" });
        }}
        confirmText={translation("ok")}
      />
    </>
  );
}
