import { getQuizRankByIncorrectAnswer } from '@/app/actions/dashboard/quiz/action';
import QuizQuizzesRankedChild from './_children';
import { URLSearchParams } from 'url';

const QuizQuizzesRanked = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  if (!(searchParams instanceof URLSearchParams)) {
    searchParams = new URLSearchParams(searchParams as any);
  }
  const data = await getQuizRankByIncorrectAnswer(searchParams);

  return <QuizQuizzesRankedChild data={data} />;
};

export default QuizQuizzesRanked;
