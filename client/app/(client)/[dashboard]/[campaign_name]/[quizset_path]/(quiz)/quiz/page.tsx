"use client";
import { useCountdown } from "@/app/hooks/useCountdown";
import { EndStageResult, useQuiz } from "@/providers/quiz_provider";
import { QuestionOption } from "@prisma/client";
import { useState } from "react";

export default function QuizPage() {
  const {
    quizSet,
    currentQuizStageIndex,
    currentQuestionIndex,
    currentQuizStage,
    currentStageQuestions,
    endStage,
    confirmAnswer,
    nextStage,
    nextQuestion,
    canNextQuestion,
    quizStagesTotalScore,
  } = useQuiz();

  // // 선택된 옵션 상태
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [lifeCount, setLifeCount] = useState<number>(currentQuizStage.lifeCount);
  const [gameOver, setGameOver] = useState(false);
  const [isSelectedCorrectCount, setIsSelectedCorrectCount] = useState(0);

  const [count, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({ countStart: currentQuizStage.timeLimitSeconds });

  const handleConfirmAnswer = async (questionId: string) => {
    if (selectedOptionIds.length === 0) {
      alert("선택된 옵션이 없습니다.");
      return;
    }

    const result = await confirmAnswer(
      // currentQuizStage?.id,
      questionId,
      selectedOptionIds,
      30
    );

    if (result.isCorrect) {
      alert("정답입니다!");
      next();
    } else {
      alert("틀렸습니다!");
    }
  };

  const next = async () => {
    setSelectedOptionIds([]);
    setIsSelectedCorrectCount(0);

    if (canNextQuestion()) {
      nextQuestion();
      return;
    }

    const result: EndStageResult = await endStage(3);
    alert(`스테이지 완료! 점수: ${result.score}`);

    nextStage();
  };

  const handleOptionChange = (optionId: string) => {
    setSelectedOptionIds((prevSelected) => {
      if (prevSelected.includes(optionId)) {
        // 이미 선택된 옵션이면 제거
        console.log(`Option ${optionId} 해지됨`);

        const result = prevSelected.filter((id) => id !== optionId);
        console.log("result", result);
        return result;
      } else {
        // 선택된 옵션 추가
        console.log(`Option ${optionId} 선택됨`);

        return [...prevSelected, optionId];
      }
    });
  };

  const renderQuizPage = () => {
    if (!currentQuizStage || !currentStageQuestions) {
      return <p>퀴즈 스테이지를 찾을 수 없습니다.</p>;
    }

    const question = currentStageQuestions[currentQuestionIndex];
    const totalQuestions = currentStageQuestions?.length;
    const totalStages = quizSet.quizStages.length;

    const bgImageUrl = `${process.env.ASSETS_DOMAIN}${currentQuizStage.backgroundImageUrl}`;
    const charImageUrl = `${process.env.ASSETS_DOMAIN}${currentQuizStage.characterImageUrl}`;

    return (
      <>
        <p>현재까지 스코어: {quizStagesTotalScore}</p>
        <p>
          stage: {currentQuizStageIndex + 1}/{totalStages}
        </p>
        <p>stage에 주어진 하트 수: {currentQuizStage.lifeCount}</p>
        <p>
          question: {currentQuestionIndex + 1}/{totalQuestions}
        </p>
        <h3>{currentQuizStage?.name}</h3>
        <p>시간제한: {question.timeLimitSeconds}</p>
        <p>{question.text}</p>
        {question.options &&
          question.options.map((option: QuestionOption) => (
            <div key={option.id}>
              <input
                type="checkbox"
                name="option"
                value={option.id}
                checked={selectedOptionIds.includes(option.id)}
                onChange={() => handleOptionChange(option.id)} // 옵션 선택/해제 처리
              />
              <label>
                {option.text}({option.isCorrect ? "o" : "x"})
              </label>
            </div>
          ))}
        <button
          onClick={() => {
            handleConfirmAnswer(question.id);
          }}
          disabled={selectedOptionIds.length === 0} // 선택된 옵션이 없으면 버튼 비활성화
        >
          확인
        </button>
        <img src={bgImageUrl} alt="quiz background" />
        <img src={charImageUrl} alt="quiz character" />
      </>
    );
  };

  return <div>{renderQuizPage()}</div>;
}

{
  /* Question Area*/
}
//   <div className="pt-[70px]">
//   <Qusetion questionText={question.text} />
//   <div className="pt-[30px] pb-[60px] px-5 flex flex-col gap-4">
//     {question.options &&
//       question.options.map((option: QuestionOption) => {
//         return (
//           <motion.label
//             key={option.id}
//             onClick={() => {
//               handleOptionSave(option.id);
//               handleConfirmAnswer(question, option.id);
//               console.log("click");
//             }}
//             className={cn(
//               "rounded-[20px] py-4 px-6 bg-white hover:cursor-pointer",
//               selectedOptionIds.includes(option.id) && !option.isCorrect && "bg-[#EE3434] text-white",
//               selectedOptionIds.includes(option.id) && option.isCorrect && "bg-[#2686F5] text-white",
//               isSelectedCorrectCount && "pointer-events-none"
//             )}
//             animate={
//               selectedOptionIds.includes(option.id) && !option.isCorrect
//                 ? { x: [0, -5, 5, -5, 5, 0] }
//                 : selectedOptionIds.includes(option.id) && option.isCorrect
//                 ? { scale: [1, 1.1, 1] }
//                 : { x: 0, scale: 1 }
//             }
//             transition={{ duration: 0.5, ease: "easeInOut" }}
//           >
//             {option.text}({option.isCorrect ? "o" : "x"})
//             <input
//               type="checkbox"
//               checked={selectedOptionIds.includes(option.id)}
//               readOnly
//               className="hidden"
//               onClick={(e) => {
//                 e.stopPropagation();
//               }}
//             />
//           </motion.label>
//         );
//       })}
//   </div>
// </div>

// 모두 맞았으면
// 다음문제로 넘어가는 조건: selectedOptionIds, optionId의 isCorrect 수와 question.options.isCorrect 수가 같을 경우 next()
//   const correctCount = question.options.map((option) => option.isCorrect).filter((answer) => answer === true).length;
//   const selectedIds = question.options.filter((option) => [...new Set([...selectedOptionIds, optionId])].includes(option.id));
//   const selectedCorrectCount = selectedIds.filter((id) => id.isCorrect === true).length;
//   setIsSelectedCorrectCount(selectedCorrectCount);

//   if (correctCount === selectedCorrectCount) {
//     await sleep(1000);
//     await next();
//   }

//   resetCountdown();
// }
// // 틀렸으면 도전 횟수 차감 & 시간 다시 시작
// else {
//   setLifeCount((lifeCount) => lifeCount - 1);

{
  /* <GameOverAlertDialog gameOver={gameOver} />
</div> */
}
