"use client";

import useGetItem from "@/app/hooks/useGetItem";
import { QuizSet, UserQuizHistory } from "@prisma/client";
import { useSession } from "next-auth/react";

type QuizData = {
  userQuizHistory: UserQuizHistory;
  quizSets: QuizSet[];
};

export default function QuizPage() {
  // const { quizCampaign, quizMetadata } = useQuiz();
  const { data: session } = useSession();

  const userId = session?.user?.id;
  // console.log('session?.user:', session?.user);
  // if (userId == null) {
  //   return <p>Not authenticated</p>;
  // }

  const testCampaignId = "c8197cf4-3d49-4c48-a294-d47716708382";
  const testMetadataId = "90e9d95e-2ee0-4f28-9060-8e7d053b97f3";

  const {
    isLoading,
    error,
    item: quizData,
  } = useGetItem<QuizData>(
    `/api/campaign/${testCampaignId}/quizsets?userId=${userId}&metadataId=${testMetadataId}`
  );

  console.log(isLoading, error, quizData);

  return (
    <div>
      <h1>Quiz Data</h1>
      {quizData ? (
        <pre>{JSON.stringify(quizData, null, 2)}</pre>
      ) : (
        <p>No quiz data available</p>
      )}
    </div>
  );
}
