import { useEffect, useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/utils/fetcher";

export default function useDomainRegionInfo(domainCode: string | undefined) {
  const { data: domainData, isLoading: loadingDomain } = useSWR(
    domainCode ? `${process.env.NEXT_PUBLIC_API_URL}/api/domains?domain_code=${domainCode}` : null,
    swrFetcher
  );

  const [regionName, setRegionName] = useState<string>("");
  const [openSheet, setOpenSheet] = useState(false);
  const [isPolicyAcceptCountry, setIsPolicyAcceptCountry] = useState(false);
  const [domainName, setDomainName] = useState<string>("");

  useEffect(() => {
    if (!domainCode) {
      return;
    }

    if (!loadingDomain && domainData?.items[0]?.subsidiary?.region?.name) {
      const name = domainData.items[0].subsidiary.region.name;
      setDomainName(domainData.items[0].name);
      setRegionName(name);
      setIsPolicyAcceptCountry(name === "MENA" || name === "Korea");
    }
  }, [loadingDomain, domainData]);

  return {
    domainCode,
    regionName,
    openSheet,
    setOpenSheet,
    isPolicyAcceptCountry,
    loadingDomain,
    domainData,
    domainName,
  };
}
