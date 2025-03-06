export const legendCapitalizeFormatter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const legendUpperCaseFormatter = (text: string) => {
  return text.toUpperCase();
};

export const updateCampaignId = ({
  pathname,
  campaignId,
}: {
  pathname: string;
  campaignId: string | undefined;
}) => {
  if (pathname.startsWith('/dashboard/') && campaignId) {
    return pathname.replace(/\/dashboard\/[^/]+/, `/dashboard/${campaignId}`);
  }
  return pathname;
};
