import { getBadgeEmailTemplete } from "@/templete/email";
import { QuizStageEx } from "@/types/apiTypes";
import * as Sentry from "@sentry/nextjs";
import fetchRetry from "fetch-retry";

const fetch = fetchRetry(global.fetch);

export class QuizBadgeHandler {
  issueBadge = async (
    userId: string,
    campaignId: string,
    domainId: string,
    activityId: string,
    elapsedSeconds: number
  ): Promise<boolean> => {
    try {
      const registered = await this.postActivityRegister(
        userId,
        campaignId,
        domainId,
        activityId
      );

      if (!registered) {
        return false;
      }

      const attended = await this.postActivityProcess(
        userId,
        campaignId,
        domainId,
        activityId,
        elapsedSeconds
      );

      console.log("issueBadge registered", registered);
      console.log("issueBadge attended", attended);

      return registered && attended;
    } catch (error) {
      Sentry.captureException(error, (scope) => {
        scope.setContext("operation", {
          type: "api",
          endpoint: "issueBadge",
          description: "Failed to issue badge",
        });
        scope.setTag("activityId", activityId);
        return scope;
      });
      return false;
    }
  };

  sendBadgeEmail = async (
    userId: string,
    badgeImageUrl: string,
    translationMessage: { [key: string]: string },
    currentQuizStageIndex: number,
    currentQuizStage: QuizStageEx | null,
    isOldCampaign: boolean = false
  ) => {
    try {
      // console.log("sendBadgeEmail");

      const galaxyAIExpert: string = translationMessage["galaxy_ai_expert"];
      const emailBadgeDate: string = translationMessage["email_badge_date"];
      const emailBadgeDescriptionA: string =
        translationMessage["email_badge_description_1"];

      let emailBadgeDescriptionB: string =
        translationMessage["email_badge_description_2"];
      if (isOldCampaign) {
        if (currentQuizStageIndex === 2) {
          emailBadgeDescriptionB =
            translationMessage["email_badge_description_2"];
        } else if (currentQuizStageIndex === 3) {
          emailBadgeDescriptionB =
            translationMessage["email_badge_description_3"];
        }
      } else {
        currentQuizStage?.badgeType === "FIRST" ||
        currentQuizStage?.badgeType === null
          ? translationMessage["email_badge_description_2"]
          : translationMessage["email_badge_description_3"];
      }

      const emailBadgeDescriptionC: string =
        translationMessage["email_badge_description_4"];

      const subject: string = "You have earned the Galaxy AI Expert Badge.";
      const bodyHtml: string = getBadgeEmailTemplete(
        badgeImageUrl,
        galaxyAIExpert,
        emailBadgeDate,
        emailBadgeDescriptionA,
        emailBadgeDescriptionB,
        emailBadgeDescriptionC
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/activity/send-badge-email`,
        {
          retries: 2,
          retryDelay: 500,
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            userId,
            subject,
            bodyHtml,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // TODO: 이메일 전송 오류 저장해 놓기
        throw new Error(errorData.message || "Failed to fetch sendBadgeEmail");
      }

      // const data = await response.json();
      // console.log("sendBadgeEmail data", data);

      return true;
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred");
      Sentry.captureMessage(
        `Failed to send badge email: ${err.message}, ${userId}`
      );
      Sentry.captureException(err);

      return false;
    }
  };

  postActivityRegister = async (
    userId: string,
    campaignId: string,
    domainId: string,
    activityId: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/register`,
        {
          retries: 2,
          retryDelay: 1000,
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            activityId,
            campaignId,
            domainId,
          }),
        }
      );

      console.log("postActivityRegister response", response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register activities");
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";

      Sentry.captureMessage(
        `Failed to register activity after retries: ${errorMessage}, ${activityId}`
      );
      Sentry.captureException(err);
      return false;
    }
  };

  postActivityProcess = async (
    userId: string,
    campaignId: string,
    domainId: string,
    activityId: string,
    elapsedSeconds: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/end`,
        {
          retries: 2,
          retryDelay: 1000,
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            activityId,
            campaignId,
            domainId,
            status: "Attended",
            elapsedSeconds: 120, // 혹은 elapsedSeconds
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update activity");
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      console.error(`postActivityProcess `, errorMessage);

      Sentry.captureException(err, (scope) => {
        scope.setContext("operation", {
          type: "http_request",
          endpoint: "/api/sumtotal/activity/end",
          method: "POST",
          description: "Failed to end activity",
        });
        scope.setTag("activity_id", activityId);
        return scope;
      });
      return false;
    }
  };
}
