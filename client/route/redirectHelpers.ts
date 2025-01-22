import { redirect } from "next/navigation";

export const redirectToErrorPage = () => {
  redirect("/error/not-found");
};

export const redirectToCampaignNotReady = () => {
  redirect("/error/campaign/not-ready");
};

export const redirectToRegisterPage = (campaignName: string) => {
  redirect(`/${campaignName}/register`);
};

export const redirectToQuizSet = (
  campaignName: string,
  quizSetPath: string
) => {
  // console.log("redirectToQuizSet:", campaignName, quizSetPath);
  redirect(`/${campaignName}/${quizSetPath}`);
};
