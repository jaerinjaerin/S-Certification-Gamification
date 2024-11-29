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
    const campaignName = segments[0];
    // const campaignQuizSetId = segments.length > 1 ? segments[1] : null;
    let campaignQuizSetId: string | null = null;
    if (segments.length > 1 && isValidCampaignQuizSetId(segments[1])) {
      campaignQuizSetId = segments[1];
    }

    console.log("segments:", segments);
    console.log("campaignQuizSetId:", campaignQuizSetId);

    return campaignQuizSetId
      ? `/${campaignName}/${campaignQuizSetId}/${page}${search}`
      : `/${campaignName}/${page}${search}`;
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

  return { generateTargetUrl, routeToPage };
};
