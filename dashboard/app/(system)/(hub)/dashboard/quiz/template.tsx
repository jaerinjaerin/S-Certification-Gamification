import QuizQuizzesRanked from './@infoQuizzesRankedByHighestIncorrectAnswerRate/page';
import QuizIncorrectAnswerRate from './@statisticsIncorrectAnswerRateByCategory/page';
import QuizFilterForm from './@filters/page';
import { QuizProvider } from './_provider/provider';

const QuizTemplete = () => {
  return (
    <QuizProvider>
      <div className="space-y-3">
        <QuizFilterForm />
        <QuizIncorrectAnswerRate />
        <QuizQuizzesRanked />
      </div>
    </QuizProvider>
  );
};

export default QuizTemplete;
