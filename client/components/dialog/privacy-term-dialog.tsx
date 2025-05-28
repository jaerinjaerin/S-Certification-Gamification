import { X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/utils/utils";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Markdown } from "../markdown/markdown";
import { arabicDomains, myanmarDomainCode } from "@/core/config/default";

export default function PrivacyOrTermDialog({
  dialogProps,
}: {
  dialogProps: {
    contents: string;
    popupTitle: string;
    actionButtonText: string;
    triggerChildren: React.ReactNode | string;
    domainCode: string | undefined;
  };
}) {
  const { contents, popupTitle, actionButtonText, triggerChildren, domainCode } = dialogProps;
  const isArabicCountry = arabicDomains.includes(domainCode ?? "");
  return (
    <Dialog>
      <DialogTrigger>{triggerChildren}</DialogTrigger>
      <DialogContent className="!px-[10px] text-xs">
        <DialogHeader>
          <DialogTitle style={{ wordBreak: "break-word" }}>{popupTitle}</DialogTitle>
        </DialogHeader>
        <div className={cn("max-h-[50svh] overflow-hidden overflow-y-scroll font-one font-medium ")} dir={isArabicCountry ? "rtl" : "ltr"}>
          <Markdown className={cn("text-xs", isArabicCountry && "text-right", domainCode === myanmarDomainCode && "leading-loose")}>
            {contents}
          </Markdown>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"primary"}>
              <span>{actionButtonText}</span>
            </Button>
          </DialogClose>
          <DialogClose className="absolute top-5 right-5">
            <X />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
