import { useTranslations } from "next-intl";
import useCheckLocale from "@/hooks/useCheckLocale";
import { cn } from "@/utils/utils";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Dispatch } from "react";
import { LoginAction, LoginState } from "@/types/pages/login/types";

const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email) ? true : false;
};

type EmailInputDialogProps = {
  children: React.ReactNode;
  state: LoginState;
  dispatch: Dispatch<LoginAction>;
  sendEmail: () => Promise<void>;
};

export default function EmailInputDialog({ children, state, dispatch, sendEmail }: EmailInputDialogProps) {
  const translation = useTranslations();
  const { isArabic } = useCheckLocale();

  return (
    <Dialog open={state.step === "email"}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{translation("login")}</DialogTitle>
          <DialogDescription>{translation("login_by_send_code")}</DialogDescription>
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
              className={cn("w-full sm:min-w-[280px] bg-[#E5E5E5] p-3 rounded-[10px] font-one font-medium text-base", isArabic && "text-right")}
              value={state.email}
              onChange={(e) => dispatch({ type: "SET_EMAIL", payload: e.target.value })}
              disabled={state.loading}
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
            disabled={!state.email || state.loading || !isValidEmail(state.email)}
          >
            <span>{translation("send_code")}</span>
          </Button>
          <DialogClose
            className="absolute top-5 right-5"
            onClick={() => {
              dispatch({ type: "SET_STEP", payload: "init" });
              dispatch({ type: "SET_EMAIL", payload: "" });
            }}
          >
            <X />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
