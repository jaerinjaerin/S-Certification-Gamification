import { getQuizRankByCategory } from '@/app/actions/dashboard/quiz/action';
import QuizIncorrectAnswerRateChild from './_children';
import { URLSearchParams } from 'url';

const QuizIncorrectAnswerRate = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const data = await getQuizRankByCategory(searchParams);

  return <QuizIncorrectAnswerRateChild data={data} />;
};

export default QuizIncorrectAnswerRate;
