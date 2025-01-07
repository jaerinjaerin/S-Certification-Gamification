import QuizIncorrectAnswerRate from "./(statics)/@incorrect-answer-rate/page";
import QuizQuizzesRanked from "./(statics)/@quizzes-ranked/page";
import QuizFilterForm from "./@filters/page";

const UserTemplete = () => {
  return (
    <div className="space-y-3">
      <QuizFilterForm />
      <QuizIncorrectAnswerRate />
      <QuizQuizzesRanked />
    </div>
  );
};

export default UserTemplete;
