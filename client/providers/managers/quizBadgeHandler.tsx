import { getBadgeEmailTemplete } from "@/templete/email";
import * as Sentry from "@sentry/nextjs";

export class QuizBadgeHandler {
  issueBadge = async (
    activityId: string,
    elapsedSeconds: number
  ): Promise<boolean> => {
    try {
      console.log("issueBadge");
      const registered = await this.postActivitieRegister(activityId);
      const result = await this.postActivityEnd(activityId, elapsedSeconds);

      return false;
    } catch (error) {
      Sentry.captureException(error);
      await Sentry.flush(2000); // 최대 2초 대기
      return false;
    }
  };

  sendBadgeEmail = async (
    userId: string,
    badgeImageUrl: string,
    translationMessage: { [key: string]: string },
    currentQuizStageIndex: number
  ) => {
    try {
      console.log("sendBadgeEmail");
      const subject: string = "You have earned the Galaxy AI Expert Badge.";
      const bodyHtml: string = getBadgeEmailTemplete(
        badgeImageUrl,
        translationMessage,
        currentQuizStageIndex
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/activity/send-badge-email`,
        {
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
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();
      console.log("sendBadgeEmail data", data);

      return true;
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred");
      Sentry.captureMessage(
        `Failed to send badge email: ${err.message}, ${userId}`
      );
      Sentry.captureException(err);

      // Sentry 전송을 명시적으로 대기
      await Sentry.flush(2000); // 최대 2초 대기

      return false;
      // TODO: 이메일 전송 오류 저장해 놓기
      // throw new Error(err.message || "An unexpected error occurred");
    }
  };

  postActivitieRegister = async (activityId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/register`,
        {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            activityId: activityId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // TODO: 활동 등록 오류 저장해 놓기
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();

      return true;
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred");
      Sentry.captureMessage(
        `Failed to register activity: ${err.message}, ${activityId}`
      );
      Sentry.captureException(err);
      return false;
      // TODO: 활동 등록 오류 저장해 놓기
      // throw new Error(err.message || "An unexpected error occurred");
    }
  };

  postActivityEnd = async (
    activityId: string,
    elapsedSeconds: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/end`,
        {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            activityId: activityId,
            status: "Attended",
            // elapsedSeconds: elapsedSeconds,
            elapsedSeconds: 120,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // TODO: 활동 등록 오류 저장해 놓기
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();
      console.log("data", data);

      return true;
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred");
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
      // TODO: 활동 등록 오류 저장해 놓기
      // throw new Error(err.message || "An unexpected error occurred");
    }
  };
}
