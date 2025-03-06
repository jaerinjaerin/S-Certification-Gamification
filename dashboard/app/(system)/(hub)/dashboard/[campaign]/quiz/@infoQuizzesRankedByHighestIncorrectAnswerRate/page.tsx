import { getQuizRankByIncorrectAnswer } from '@/app/actions/dashboard/quiz/action';
import QuizQuizzesRankedChild from './_children';
import { URLSearchParams } from 'url';

const QuizQuizzesRanked = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const data = await getQuizRankByIncorrectAnswer(searchParams);

  return <QuizQuizzesRankedChild data={data} />;
};

export default QuizQuizzesRanked;
