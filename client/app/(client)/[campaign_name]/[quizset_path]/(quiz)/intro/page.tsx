"use client";

import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";

export default function QuizIntro() {
  const { quizSet, language, quizLog } = useQuiz();
  const { routeToPage } = usePathNavigator();

  const routeQuizMap = async () => {
    routeToPage("map");
  };

  const testSendEmail = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/send-verify-email`,
      {
        method: "POST",
        // headers: {
        //   "Content-Type": "application/json",
        // },
        body: JSON.stringify({
          toAddress: "bluedevstorm@gmail.com",
          subject: "Test Email",
          htmlBody: "<h1>Hello</h1><p>This is a test email.</p>",
          textBody: "Hello\nThis is a test email.",
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("Email sent successfully:", data.messageId);
    } else {
      console.error("Error sending email:", data.error);
    }
  };

  return (
    <div>
      <h1>Intro (Sumtotal)</h1>
      {language && <p>언어: {language.name}</p>}
      {quizSet && <p>퀴즈 스테이지 개수: {quizSet.quizStages.length}</p>}
      <p>다음 Stage: {(quizLog?.lastCompletedStage ?? 0) + 1}</p>
      <button onClick={routeQuizMap}>Go Quiz Map</button>
      <button disabled onClick={testSendEmail}>
        Send Test Mail
      </button>
    </div>
  );
}
