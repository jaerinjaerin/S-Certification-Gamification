"use client";

// React
import { Dispatch, SetStateAction } from "react";

// Next-intl
import { useTranslations } from "next-intl";

// Hooks
import usePolicyContent from "@/hooks/usePolicyContent";

// Utils
import { isEmpty } from "@/utils/utils";

// Components
import PolicySheet from "./login/policy-sheet";
import PrivacyOrTermDialog from "./dialog/privacy-term-dialog";

type BasePolicyRendererProps = {
  view: "sheet" | "dialog";
  domainCode: string | undefined;
};

type SheetPolicyRendererProps = BasePolicyRendererProps & {
  view: "sheet";
  onClick: () => Promise<void>;
  loading: boolean;
  open: boolean;
  setOpenSheet: Dispatch<SetStateAction<boolean>>;
  autoOpen?: boolean;
};

type DialogPolicyRendererProps = BasePolicyRendererProps & {
  view: "dialog";
  dialogType: "privacy" | "term";
};

type PolicyRendererProps = SheetPolicyRendererProps | DialogPolicyRendererProps;

export default function PolicyRenderer(props: PolicyRendererProps) {
  const translation = useTranslations();

  const { privacyContent, termContent, agreementContent } = usePolicyContent(props.domainCode);

  // agreementContent가 있는 경우, privacyContent 위에 추가
  const SHEET_PRIVACY_CONTENT = isEmpty(agreementContent)
    ? privacyContent
    : `
  ${agreementContent} 
  =====================================   
  ${privacyContent}`;

  if (props.view === "sheet") {
    return (
      <PolicySheet
        open={props.open}
        setOpenSheet={props.setOpenSheet}
        onClick={props.onClick}
        privacyContent={SHEET_PRIVACY_CONTENT}
        termContent={termContent}
        loading={props.loading}
        domainCode={props.domainCode}
      />
    );
  }

  if (props.dialogType === "privacy") {
    return (
      <PrivacyOrTermDialog
        dialogProps={{
          contents: privacyContent,
          popupTitle: `${translation("privacy")}`,
          actionButtonText: `${translation("accept")}`,
          triggerChildren: `${translation("privacy")}`,
          domainCode: props.domainCode,
        }}
      />
    );
  }

  if (props.dialogType === "term") {
    return (
      <PrivacyOrTermDialog
        dialogProps={{
          popupTitle: `${translation("term")}`,
          contents: `${termContent}`,
          actionButtonText: `${translation("ok")}`,
          triggerChildren: `${translation("term")}`,
          domainCode: props.domainCode,
        }}
      />
    );
  }
}
