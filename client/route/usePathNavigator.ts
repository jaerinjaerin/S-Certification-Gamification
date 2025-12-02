"use client";

import { isValidCampaignQuizSetId } from "@/utils/validationUtils";

export const usePathNavigator = () => {
  /**
   * Generates a target URL based on the current path segments.
   * @param page - The target page (e.g., "quiz" or "map").
   * @param search - The query string (optional). Defaults to the current URL's query string.
   * @returns The constructed URL string.
   */
  const generateTargetUrl = (
    page: string,
    search: string = window.location.search
  ): string => {
    const pathname = window.location.pathname;
    const segments = pathname.split("/").filter(Boolean); // Remove empty segments
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""; // Base path for additional flexibility
    const hasBasePath = basePath !== "";

    // Adjust index based on environment
    const campaignName = hasBasePath ? segments[1] : segments[0];
    let campaignQuizSetId: string | null = null;

    if (hasBasePath) {
      if (segments.length > 2 && isValidCampaignQuizSetId(segments[2])) {
        campaignQuizSetId = segments[2];
      }
    } else {
      if (segments.length > 1 && isValidCampaignQuizSetId(segments[1])) {
        campaignQuizSetId = segments[1];
      }
    }

    // console.log("segments:", segments);
    // console.log("campaignQuizSetId:", campaignQuizSetId);

    return campaignQuizSetId
      ? `${basePath}/${campaignName}/${campaignQuizSetId}/${page}${search}`
      : `${basePath}/${campaignName}/${page}${search}`;
  };

  /**
   * Redirects to a dynamically generated URL.
   * @param page - The target page (e.g., "quiz" or "map").
   * @param search - The query string (optional). Defaults to the current URL's query string.
   */
  const routeToPage = (
    page: string,
    search: string = window.location.search
  ): void => {
    const targetUrl = generateTargetUrl(page, search);
    window.location.href = targetUrl;
  };

  /**
   * Redirects to the error/not-found page based on the current path.
   * @param additionalPath - The additional path for error handling.
   * @param search - The query string (optional). Defaults to the current URL's query string.
   */
  const routeToError = (
    additionalPath = "",
    search = window.location.search
  ) => {
    const pathname = window.location.pathname;
    const segments = pathname.split("/").filter(Boolean); // Remove empty segments
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""; // Base path for additional flexibility
    const hasBasePath = basePath !== "";

    const campaignName = hasBasePath ? segments[1] : segments[0];

    // Construct the new error URL
    const errorUrl = `${basePath}/${campaignName}/${additionalPath}${search}`;

    // Use window.location to navigate
    window.location.href = errorUrl;
  };

  return { generateTargetUrl, routeToError };
};
