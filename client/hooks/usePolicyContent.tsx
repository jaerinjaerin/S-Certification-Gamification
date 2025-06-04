import { swrFetcher } from "@/utils/fetcher";
import useSWRImmutable from "swr/immutable";

function usePolicyContent(domainCode: string | undefined) {
  const {
    data: privacyData,
    isLoading: loadingPrivacy,
    error: errorPrivacy,
  } = useSWRImmutable(domainCode ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/privacy/${domainCode}.json` : null, swrFetcher);

  const {
    data: termData,
    isLoading: loadingTerm,
    error: errorTerm,
  } = useSWRImmutable(domainCode ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/term/${domainCode}.json` : null, swrFetcher);

  const { data: agreementData, error: errorAgreement } = useSWRImmutable(
    domainCode === "NAT_2410" ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/agreement/${domainCode}.json` : null,
    swrFetcher
  );

  const isLoading = loadingPrivacy || loadingTerm;
  const isComplete = !!(privacyData?.contents && termData?.contents);
  const isError = errorPrivacy || errorTerm || errorAgreement;

  return {
    privacyContent: privacyData?.contents || "",
    termContent: termData?.contents || "",
    agreementContent: agreementData?.contents || "",
    isLoading,
    isComplete,
    isError,
  };
}

export default usePolicyContent;
