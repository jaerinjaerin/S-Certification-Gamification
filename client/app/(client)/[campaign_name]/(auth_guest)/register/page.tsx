"use client";

// Next-auth
import { useSession } from "next-auth/react";

// Next-intl
import { useTranslations } from "next-intl";

// Components
import { ResultAlertDialog } from "@/components/dialog/result-alert-dialog";
import LoginButton from "@/components/login/login-button";
import PolicyRenderer from "@/components/policy-renderer";
import Spinner from "@/components/ui/spinner";

// Hooks
import useGAPageView from "@/core/monitoring/ga/usePageView";
import useCheckLocale from "@/hooks/useCheckLocale";
import useDomainRegionInfo from "@/hooks/useGetDomainInfo";

// Providers
import { useCampaign } from "@/providers/campaignProvider";

// Types
import RegisterForm, { RegisterFormComboboxContainer, RegisterFormContainer, RegisterFormBackground } from "@/components/register";
import { useRegisterForm } from "@/providers/register/register-form-provider";

export default function GuestRegisterPage({ params }: { params: { campaign_name: string } }) {
  useGAPageView();

  const {
    isDisabled,
    selectedCountry,
    channelName,
    checkRegisteredLoading,
    loading,
    errorMessage,
    setErrorMessage,
    createItem,
    selectedJobId,
    quizLanguageCode,
    jobs,
    selectedChannel,
    selectedChannelSegmentId,
  } = useRegisterForm();
  const { isArabic } = useCheckLocale();
  const translation = useTranslations();
  const { openSheet, setOpenSheet, isPolicyAcceptCountry } = useDomainRegionInfo(selectedCountry?.code);
  const { data: session, status } = useSession();
  const { campaign } = useCampaign();

  const routeQuizPage = async () => {
    if (!selectedCountry) {
      setErrorMessage(translation("required_country")); // 번역 필요
      return;
    }

    if (!selectedJobId) {
      setErrorMessage(translation("required_country")); // 번역 필요
      return;
    }

    if (!quizLanguageCode) {
      setErrorMessage(translation("required_quiz_language")); // 번역 필요
      return;
    }
    createItem({
      url: `${process.env.NEXT_PUBLIC_BASE_PATH}/api/users/${session?.user.id}/register`,
      body: {
        domainId: selectedCountry.id,
        domainCode: selectedCountry.code,
        subsidiaryId: selectedCountry.subsidiaryId,
        regionId: selectedCountry?.regionId,
        jobId: jobs.find((j) => j.value === selectedJobId)?.id,
        storeId: jobs.find((j) => j.value === selectedJobId)?.storeId,
        languageCode: quizLanguageCode,
        channelId: selectedChannel?.channelId,
        channelName: channelName?.trim(),
        channelSegmentId: selectedChannelSegmentId,
        campaignId: campaign.id,
        campaignSlug: campaign.name.toLowerCase() === "s25" ? campaign.name : campaign.slug,
      },
    });
  };
  const handleClickLoginButton = async () => {
    if (isPolicyAcceptCountry) {
      setOpenSheet(true);
    } else {
      await routeQuizPage();
    }
  };

  return (
    <RegisterFormBackground>
      <RegisterFormContainer>
        <RegisterFormComboboxContainer>
          <RegisterForm />
        </RegisterFormComboboxContainer>
        <LoginButton disabled={isDisabled()} isArabic={isArabic} translationLogin={translation("save")} onClick={handleClickLoginButton} />
      </RegisterFormContainer>

      {(checkRegisteredLoading || status === "loading") && <Spinner />}
      {isPolicyAcceptCountry && openSheet && (
        <PolicyRenderer
          view="sheet"
          onClick={routeQuizPage}
          loading={loading}
          open={openSheet}
          setOpenSheet={setOpenSheet}
          domainCode={selectedCountry?.code}
        />
      )}
      <ResultAlertDialog
        open={!!errorMessage}
        description={errorMessage ?? null}
        onConfirm={() => {
          setErrorMessage(null);
        }}
        translationOk={translation("ok")}
      />
    </RegisterFormBackground>
  );
}
