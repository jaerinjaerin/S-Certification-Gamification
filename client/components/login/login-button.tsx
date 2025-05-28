import { cn } from "@/utils/utils";
import { Button } from "../ui/button";

type LoginButtonProps = {
  disabled: boolean;
  isArabic: boolean;
  translationLogin: string;
  onClick: (() => Promise<void>) | (() => void);
  children?: React.ReactNode;
};

export default function LoginButton({ disabled, isArabic, translationLogin, onClick, children }: LoginButtonProps) {
  return (
    <Button variant={"primary"} disabled={disabled} className={cn("disabled:bg-disabled ", isArabic && "flex-row-reverse")} onClick={onClick}>
      {children}
      <span>{translationLogin}</span>
    </Button>
  );
}
