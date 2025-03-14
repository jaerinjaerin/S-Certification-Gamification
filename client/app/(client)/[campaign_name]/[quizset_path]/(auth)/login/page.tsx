"use client";

import PolicyFooter from "@/components/dialog/privacy-and-term";
import PolicySheet from "@/components/login/policy-sheet";
import {
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useLoader from "@/components/ui/loader";
import Spinner from "@/components/ui/spinner";
import useGAPageView from "@/core/monitoring/ga/usePageView";
import useCheckLocale from "@/hooks/useCheckLocale";
import { usePolicy } from "@/providers/policyProvider";
import { cn } from "@/utils/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import { AutoTextSize } from "auto-text-size";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Login({
  params,
}: {
  params: { campaign_name: string; quizset_path: string };
}) {
  useGAPageView();
  const { status } = useSession();
  const translation = useTranslations();
  const { isArabic } = useCheckLocale();
  const { loading, setLoading, renderLoader } = useLoader();
  const {
    subsidiary,
    privacyContent,
    agreementContent,
    termContent,
    domainName,
  } = usePolicy();
  const regionName = subsidiary && subsidiary.region.name;

  const isPolicyAcceptCountry = regionName === "MENA" || regionName === "Korea";
  const [openSheet, setOpenSheet] = useState(isPolicyAcceptCountry);
  const PRIVACY_CONTENT = agreementContent
    ? `${agreementContent} === ${privacyContent}`
    : privacyContent;

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const processSignIn = async () => {
    setLoading(true);

    try {
      console.log("로그인 시도");
      await signIn("sumtotal", {
        callbackUrl: `${window.location.origin}/${params.campaign_name}/${params.quizset_path}/map`,
      });
    } catch (error) {
      console.error("로그인 오류:", error);
      setErrorMessage(translation("unexpected_error"));
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <Spinner />;
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
            <span className="block text-lg font-bold">
              {translation("galaxy_ai_expert")}
            </span>
            <div
              className={cn("flex flex-col items-center my-auto gap-[49px]")}
            >
              <div className="font-bold text-center text-4xl/normal sm:text-5xl/normal text-balance px-[20px] max-w-[420px] min-w-[280px] w-full h-[200px] ">
                <AutoTextSize mode="box">
                  {translation("be_a_galaxy_ai_expert")}
                </AutoTextSize>
              </div>
              {!isPolicyAcceptCountry && (
                <Button
                  variant={"primary"}
                  disabled={loading}
                  onClick={processSignIn}
                  className={cn(
                    "disabled:bg-disabled ",
                    isArabic && "flex-row-reverse"
                  )}
                >
                  <span>S+</span>
                  <span>{translation("login")}</span>
                </Button>
              )}
              {isPolicyAcceptCountry && (
                <PolicySheet
                  processSignIn={processSignIn}
                  loading={loading}
                  privacyContent={PRIVACY_CONTENT}
                  termContent={termContent}
                  domainName={domainName}
                  openSheet={openSheet}
                  setOpenSheet={setOpenSheet}
                >
                  <Button
                    variant={"primary"}
                    disabled={loading}
                    className={cn(
                      "disabled:bg-disabled ",
                      isArabic && "flex-row-reverse"
                    )}
                  >
                    <span>S+</span>
                    <span>{translation("login")}</span>
                  </Button>
                </PolicySheet>
              )}
            </div>
            <PolicyFooter />
          </div>
        </div>
      </div>
      {loading && renderLoader()}
      <AlertDialog
        open={!!errorMessage}
        onOpenChange={() => setErrorMessage(undefined)}
      >
        <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle></AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button variant={"primary"} onClick={() => {}}>
                <span>{translation("ok")}</span>
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
