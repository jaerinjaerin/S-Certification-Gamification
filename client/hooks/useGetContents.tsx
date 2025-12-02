import * as Sentry from "@sentry/nextjs";
import { useCallback, useEffect, useState } from "react";

async function fetchInformationAboutDomain(domainCode: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/domains?domain_code=${domainCode}`
    );

    if (!response.ok) {
      throw new Error(
        `fetch information about domain error: ${response.status}`
      );
    }

    const result = await response.json();
    if (!result) {
      throw new Error(
        `fetchError: information about domain response.json() error`
      );
    }

    return result.items;
  } catch (error) {
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "http_request",
        endpoint: "fetchInformationAboutDomain",
        method: "GET",
        description: "Failed to fetch information about domain",
      });
      scope.setTag("domainCode", domainCode);
      return scope;
    });
  }
}

async function fetchAgreementContent(domainCode: string) {
  const url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/agreement/${domainCode}.json`;
  return await fetchContent(url);
}

async function fetchPrivacyContent(domainCode: string) {
  const url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/privacy/${domainCode}.json`;
  return await fetchContent(url);
}

async function fetchTermContent(domainCode: string) {
  const url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/term/${domainCode}.json`;
  return await fetchContent(url);
}

async function fetchContent(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`fetchError: ${response.status}`);
    }
    const result = await response.json();
    if (!result) {
      throw new Error(`fetchError: response.json() error`);
    }

    return result;
  } catch (error) {
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "http_request",
        endpoint: "fetchContent",
        method: "GET",
        description: "Failed to fetch content",
      });
      scope.setTag("url", url);
      return scope;
    });
  }
}

export default function useGetContents(domainCode: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [privacyContent, setPrivacyContent] = useState("");
  const [termContent, setTermContent] = useState("");
  const [agreementContent, setAgreementContent] = useState<string | null>(null);
  // const [domainInformation, setDomainInformation] = useState<DomainInfo[]>([]);
  const [isPolicyAcceptCountry, setIsPolicyAcceptCountry] = useState(false);

  const checkPolicyAcceptCountry = (domainInfo: any) => {
    if (!domainInfo.length) {
      return false;
    }

    const domainData = domainInfo[0];
    const region = domainData.subsidiary.region.name;
    return region === "MENA" || region === "Korea";
  };

  const fetchData = useCallback(async () => {
    if (!domainCode) {
      return;
    }

    try {
      setIsLoading(true);
      const privacy = (await fetchPrivacyContent(domainCode)) || {
        contents: "",
      };
      if (!privacy || !privacy.contents) {
        Sentry.captureException(
          new Error("Failed to fetch privacy content"),
          (scope) => {
            scope.setContext("operation", {
              type: "file",
              path: `/certification/s25/jsons/privacy/${domainCode}.json`,
              format: "json",
              description: "Failed to fetch privacy content",
            });
            scope.setTag("domainCode", domainCode);
            return scope;
          }
        );
        throw new Error(`Invalid privacy content: ${domainCode}`);
      }

      const term = (await fetchTermContent(domainCode)) || { contents: "" };
      if (!term || !term.contents) {
        Sentry.captureException(
          new Error("Failed to fetch term content"),
          (scope) => {
            scope.setContext("operation", {
              type: "file",
              path: `/certification/s25/jsons/term/${domainCode}.json`,
              format: "json",
              description: "Failed to fetch term content",
            });
            scope.setTag("domainCode", domainCode);
            return scope;
          }
        );
        throw new Error("Invalid term content");
      }

      const domainInfo = (await fetchInformationAboutDomain(domainCode)) || [];

      setPrivacyContent(privacy.contents);
      setTermContent(term.contents);
      // setDomainInformation(domainInfo);
      setIsPolicyAcceptCountry(checkPolicyAcceptCountry(domainInfo));

      if (domainCode === "NAT_2410") {
        const agreement = (await fetchAgreementContent(domainCode)) || {
          contents: "",
        };
        if (!agreement || !agreement.contents) {
          throw new Error("Invalid Korea agreement content");
        }

        setAgreementContent(agreement.contents);
      }
    } catch (error) {
      throw new Error(`fetchError: ${error} `);
    } finally {
      setIsLoading(false);
    }
  }, [domainCode]);

  useEffect(() => {
    if (!domainCode) {
      return;
    }

    fetchData();
  }, [domainCode, fetchData]);

  return {
    privacyContent,
    termContent,
    agreementContent,
    isPolicyAcceptCountry,
    isLoading,
  };
}
