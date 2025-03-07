import { getQuizRankByCategory } from '@/app/actions/dashboard/quiz/action';
import QuizIncorrectAnswerRateChild from './_children';
import { URLSearchParams } from 'url';

const QuizIncorrectAnswerRate = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  if (!(searchParams instanceof URLSearchParams)) {
    searchParams = new URLSearchParams(searchParams as any);
  }
  const data = await getQuizRankByCategory(searchParams);

  return <QuizIncorrectAnswerRateChild data={data} />;
};

export default QuizIncorrectAnswerRate;
