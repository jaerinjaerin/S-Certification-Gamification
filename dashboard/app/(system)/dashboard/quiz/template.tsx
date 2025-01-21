import QuizIncorrectAnswerRate from "./(statics)/@incorrect-answer-rate-by-category/page";
import QuizQuizzesRanked from "./(statics)/@quizzes-ranked-by-highest-incorrect-answer-rate/page";
import QuizFilterForm from "./@filters/page";
import { QuizProvider } from "./_provider/provider";

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
