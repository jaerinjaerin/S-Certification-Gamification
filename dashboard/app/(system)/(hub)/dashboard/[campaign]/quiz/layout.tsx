import React from 'react';
import QuizFilterForm from './filters/page';

const QuizLayout = ({
  statisticsIncorrectAnswerRateByCategory,
  infoQuizzesRankedByHighestIncorrectAnswerRate,
}: {
  statisticsIncorrectAnswerRateByCategory: React.ReactNode;
  infoQuizzesRankedByHighestIncorrectAnswerRate: React.ReactNode;
}) => {
  return (
    <div className="space-y-3">
      <QuizFilterForm />
      {statisticsIncorrectAnswerRateByCategory}
      {infoQuizzesRankedByHighestIncorrectAnswerRate}
      {/* <QuizFilterForm />
      <QuizIncorrectAnswerRate params={params} />
      <QuizQuizzesRanked params={params} /> */}
    </div>
  );
};

export default QuizLayout;
