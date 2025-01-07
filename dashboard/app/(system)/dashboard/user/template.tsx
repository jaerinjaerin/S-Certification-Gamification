import UserDomain from "./(statics)/@domain/page";
import UserExperts from "./(statics)/@experts/page";
import UserFilterForm from "./@filters/page";
import UserOutcome from "./(statics)/@outcome/page";

const QuizTemplete = () => {
  return (
    <div className="space-y-3">
      <UserFilterForm />
      <UserDomain />
      <UserExperts />
      <UserOutcome />
    </div>
  );
};

export default QuizTemplete;
