import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";
import PrivacyOrTermPopup from "./privacy-term-popup";
import { usePolicy } from "@/providers/policyProvider";

export default function PolicyFooter({ className }: { className?: string }) {
  const { privacyContent, termContent, domainName } = usePolicy();

  const translation = useTranslations();
  return (
    <div className={cn("font-medium text-sm", className)}>
      <PrivacyOrTermPopup
        popupProps={{
          popupTitle: `${translation("privacy")}`,
          contents: `${privacyContent}`,
          actionButtonText: `${translation("accept")}`,
          triggerChildren: `${translation("privacy")}`,
          domainName: domainName,
        }}
      />
      <span className="mx-2">|</span>
      <PrivacyOrTermPopup
        popupProps={{
          popupTitle: `${translation("term")}`,
          contents: `${termContent}`,
          actionButtonText: `${translation("accept")}`,
          triggerChildren: `${translation("term")}`,
          domainName: domainName,
        }}
      />
    </div>
  );
}
