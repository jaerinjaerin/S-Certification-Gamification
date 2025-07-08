import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginAction, LoginState } from "@/types/pages/login/types";
import { cn, formatToMMSS } from "@/utils/utils";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { Dispatch } from "react";

type CodeInputDialogProps = {
  state: LoginState;
  dispatch: Dispatch<LoginAction>;
  isArabic: boolean;
  count: number;
  path: string;
  sendEmail: () => Promise<void>;
};
export default function CodeInputDialog({ state, dispatch, isArabic, count, path, sendEmail }: CodeInputDialogProps) {
  const translation = useTranslations();

  const convertMessageFormat = (searchKey: string) => {
    const searchMessage = translation.rich(searchKey, {
      address: (children) => (
        <>
          <span
            className="text-blue-500"
            style={{
              wordBreak: "break-word",
            }}
          >
            {children}
          </span>
          <br />
        </>
      ),
      email: state.email,
    });

    const lastArray = React.Children.toArray(searchMessage).at(-1) as string;

    return (
      <>
        {React.Children.toArray(searchMessage).slice(0, 2)}
        <span>{lastArray.replace(".", "")}</span>
      </>
    );
  };

  const verifyCode = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    const regex = /^\d{3,}$/;
    if (!regex.test(state.code)) {
      dispatch({ type: "SET_ERROR", payload: translation("code_error") });
      dispatch({ type: "SET_LOADING", payload: false });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/verify-code`, {
        method: "POST",
        body: JSON.stringify({ email: state.email, code: state.code }),
      });

      if (!response.ok) {
        const data = await response.json();
        const { code } = data;
        if (code === "EMAIL_NOT_SENT") {
          dispatch({ type: "SET_ERROR", payload: translation("email_not_sent") });
          return;
        }

        if (code === "EMAIL_EXPIRED") {
          dispatch({ type: "SET_ERROR", payload: translation("email_expired") });
          return;
        }

        if (code === "CODE_NOT_MATCH") {
          dispatch({ type: "SET_ERROR", payload: translation("code_not_match") });
          return;
        }

        alert(translation("verify_code_failed"));
        return;
      }

      // await response.json();
      await signIn("credentials", {
        email: state.email,
        code: state.code,
        callbackUrl: `/${path}/register`,
      });

      // console.log("result", result);
    } catch (err) {
      console.error(err);
      alert(translation("unexpected_error"));
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <Dialog open={state.step === "code"}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{translation("confirm_your_email")}</DialogTitle>
          <DialogDescription>{convertMessageFormat("send_magic_link")}</DialogDescription>
        </DialogHeader>
        <div>
          <form
            id="verify-code"
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="relative font-medium font-one w-full bg-[#E5E5E5] rounded-[10px] p-1"
          >
            <input
              placeholder="code"
              inputMode="numeric"
              className={cn("bg-[#E5E5E5] rounded-[10px] w-[70%] sm:w-[80%] p-2", isArabic && "text-right translate-x-[57px]")}
              value={state.code}
              onChange={(e) => dispatch({ type: "SET_CODE", payload: e.target.value })}
              disabled={state.loading}
              required
            />
            <div className={cn("absolute top-1/2 -translate-y-1/2", isArabic ? "left-[10px]" : "right-[10px]")}>{formatToMMSS(count)}</div>
          </form>
        </div>
        <DialogFooter
          className="flex-col items-center gap-5"
          onClick={() => {
            dispatch({ type: "SET_CODE", payload: "" });
          }}
        >
          <Button
            className="text-[18px] disabled:bg-disabled"
            variant={"primary"}
            type="submit"
            form="verify-code"
            disabled={!state.code || state.loading}
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
          <DialogClose className="absolute top-5 right-5" onClick={() => dispatch({ type: "SET_STEP", payload: "init" })}>
            <X />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
