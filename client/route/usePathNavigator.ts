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
    const firstPath = segments[0];
    const campaignName = segments[1];
    // const campaignQuizSetId = segments.length > 1 ? segments[1] : null;
    let campaignQuizSetId: string | null = null;
    if (segments.length > 2 && isValidCampaignQuizSetId(segments[2])) {
      campaignQuizSetId = segments[2];
    }

    console.log("segments:", segments);
    console.log("campaignQuizSetId:", campaignQuizSetId);

    return campaignQuizSetId
      ? `/${firstPath}/${campaignName}/${campaignQuizSetId}/${page}${search}`
      : `/${firstPath}/${campaignName}/${page}${search}`;
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
   * @param search - The query string (optional). Defaults to the current URL's query string.
   */
  const routeToError = (
    additionalPath = "",
    search = window.location.search
  ) => {
    const pathname = window.location.pathname;
    const segments = pathname.split("/").filter(Boolean); // Remove empty segments
    const firstPath = segments[0];

    // Construct the new URL by appending the additional path
    const newPath = `/${firstPath}/${additionalPath}`;

    // Construct the final error URL
    const errorUrl = `${newPath}${search}`;

    // Use window.location to navigate
    window.location.href = errorUrl;
  };

  return { generateTargetUrl, routeToPage, routeToError };
};
