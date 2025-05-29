"use client";

import { ResultAlertDialog } from "@/components/dialog/result-alert-dialog";
import LoginButton from "@/components/login/login-button";
import PolicyRenderer from "@/components/policy-renderer";

import useLoader from "@/components/ui/loader";
import useGAPageView from "@/core/monitoring/ga/usePageView";
import useCheckLocale from "@/hooks/useCheckLocale";
import useDomainRegionInfo from "@/hooks/useGetDomainInfo";
import { extractCodesFromPath } from "@/utils/pathUtils";

import { cn } from "@/utils/utils";

import { AutoTextSize } from "auto-text-size";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export default function Login({ params }: { params: { campaign_name: string; quizset_path: string } }) {
  useGAPageView();

  const { status } = useSession();
  const translation = useTranslations();
  const { isArabic } = useCheckLocale();
  const { loading, Loader, startLoading, stopLoading } = useLoader();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const codes = extractCodesFromPath(params.quizset_path);
  const domainCode = codes?.domainCode;

  const { openSheet, isPolicyAcceptCountry, loadingDomain, setOpenSheet } = useDomainRegionInfo(domainCode);

  useEffect(() => {
    if (isPolicyAcceptCountry) {
      setOpenSheet(true);
    }
  }, [isPolicyAcceptCountry, setOpenSheet]);

  const processSignIn = async () => {
    startLoading();

    try {
      await signIn("sumtotal", {
        callbackUrl: `${window.location.origin}/${params.campaign_name}/${params.quizset_path}/map`,
      });
    } catch (error) {
      console.error("로그인 오류:", error);
      setErrorMessage(translation("unexpected_error"));
      stopLoading();
    }
  };

  const handleClickLoginButton = async () => {
    if (isPolicyAcceptCountry) {
      setOpenSheet(true);
    } else {
      await processSignIn();
    }
  };

  if (status === "loading" || loadingDomain) {
    return Loader(true);
  }

  return (
    <>
      <div className={cn("h-svh")}>
        <div
          className="object-fill w-full h-svh"
          style={{
            backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/common/images/main_bg2.jpg')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col items-center h-full py-[20px] relative">
            <span className="block text-lg font-bold">{translation("galaxy_ai_expert")}</span>
            <div className={cn("flex flex-col items-center my-auto gap-[49px]")}>
              <div className="font-bold text-center text-4xl/normal sm:text-5xl/normal text-balance px-[20px] max-w-[420px] min-w-[280px] w-full h-[200px] ">
                <AutoTextSize mode="box">{translation("be_a_galaxy_ai_expert")}</AutoTextSize>
              </div>
              <LoginButton disabled={loading} isArabic={isArabic} translationLogin={translation("login")} onClick={handleClickLoginButton}>
                <span>S+</span>
              </LoginButton>
            </div>

            {isPolicyAcceptCountry && (
              <PolicyRenderer
                view="sheet"
                onClick={processSignIn}
                loading={loading}
                open={openSheet}
                setOpenSheet={setOpenSheet}
                domainCode={domainCode}
              />
            )}

            <div className={cn("font-medium text-sm")}>
              <PolicyRenderer view="dialog" dialogType="privacy" domainCode={domainCode} />
              <span className="mx-2">|</span>
              <PolicyRenderer view="dialog" dialogType="term" domainCode={domainCode} />
            </div>
          </div>
        </div>
      </div>

      {Loader()}
      <ResultAlertDialog
        open={!!errorMessage}
        description={errorMessage ?? null}
        onConfirm={() => setErrorMessage(null)}
        translationOk={translation("ok")}
      />
    </>
  );
}
