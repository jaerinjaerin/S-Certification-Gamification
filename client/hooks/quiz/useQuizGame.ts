import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionEx, QuizStageEx } from "@/types/apiTypes";
import { QUIZ_CONSTANTS } from "@/constants/quiz";
import { sleep } from "@/utils/utils";
import { useQuizAnimation } from "./useQuizAnimation";
import { useCountdown } from "@/hooks/useCountdown";
import { EndStageResult } from "@/types/type";

interface UseQuizGameProps {
  currentQuizStage: QuizStageEx;
  currentStageQuestions: QuestionEx[];
  questionIndexFromContext: number;
  finalizeCurrentStage: (lifeCount: number) => Promise<EndStageResult>;
  handleStageFailure: () => Promise<void>;
  logUserAnswer: (questionId: string, selectedOptionIds: string[], elapsedSeconds: number, isCorrect: boolean) => void;
  clearUserAnswerLogs: () => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useQuizGame = ({
  currentQuizStage,
  currentStageQuestions,
  questionIndexFromContext,
  finalizeCurrentStage,
  handleStageFailure,
  logUserAnswer,
  clearUserAnswerLogs,
  startLoading,
  stopLoading,
}: UseQuizGameProps) => {
  const router = useRouter();
  const selectedOptionIdsRef = useRef<string[]>([]);

  // States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(questionIndexFromContext);
  const defaultLifeCount = currentQuizStage.lifeCount ?? QUIZ_CONSTANTS.LIFE.DEFAULT_COUNT;
  const [lifeCount, setLifeCount] = useState<number>(defaultLifeCount);
  const [gameOver, setGameOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  // Derived values
  const question: QuestionEx = currentStageQuestions[currentQuestionIndex];
  const currentStageTotalQuestions = currentStageQuestions?.length;

  // Countdown
  const [count, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: question.timeLimitSeconds,
  });
  const remainingTimeProgress = (count / question.timeLimitSeconds) * QUIZ_CONSTANTS.PROGRESS.MAX;

  // Helper functions
  const isOptionSelected = (optionId: string): boolean => {
    return selectedOptionIdsRef.current.includes(optionId);
  };

  const isAllCorrectSelected = (): boolean => {
    return question.options.every((option) => (option.isCorrect ? isOptionSelected(option.id) : true));
  };

  const resetSelectedOptionIds = () => {
    selectedOptionIdsRef.current = [];
  };

  // Animation hook
  const { animationRef, triggerAnimation, stopAnimation, getAnimateState } = useQuizAnimation({ isOptionSelected });

  // Game logic
  const handleConfirmAnswer = async (question: QuestionEx, optionId: string) => {
    if (lifeCount === 0) return;

    const isSelected = selectedOptionIdsRef.current.includes(optionId);
    if (isSelected) return;

    selectedOptionIdsRef.current = [...selectedOptionIdsRef.current, optionId];

    const result = question.options.find((option) => option.id === optionId);
    const elapsedSeconds = question.timeLimitSeconds - count;

    if (result?.isCorrect) {
      if (isAllCorrectSelected()) {
        setIsCorrectAnswer(true);
        stopCountdown();
        setSuccess(true);
        logUserAnswer(question.id, selectedOptionIdsRef.current, elapsedSeconds, true);
        stopAnimation();
        await sleep(QUIZ_CONSTANTS.UI.SUCCESS_DELAY);
        await next();
        setSuccess(false);
        return;
      }
    } else {
      setLifeCount((lifeCount) => lifeCount - 1);
      triggerAnimation();
      logUserAnswer(question.id, selectedOptionIdsRef.current, elapsedSeconds, false);
    }

    forceUpdate((prev) => prev + 1);
  };

  const next = async () => {
    setIsCorrectAnswer(false);

    if (canNextQuestion()) {
      resetSelectedOptionIds();
      nextQuestion();
      window.scrollTo({ top: 0, behavior: "smooth" });
      resetCountdown();
      return;
    }

    startLoading();
    tryFinalizeCurrentStageProcess(lifeCount);
  };

  const canNextQuestion = (): boolean => {
    return currentQuestionIndex + 1 < currentStageTotalQuestions;
  };

  const nextQuestion = (): void => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const tryFinalizeCurrentStageProcess = async (lifeCount: number) => {
    try {
      await finalizeCurrentStage(lifeCount);
      resetSelectedOptionIds();
      router.push("complete");
    } catch (error) {
      console.error("fail retFyfinalizeProcess", error);
      showFinalizeCurrentStageProcessAlert();
    }
  };

  const showFinalizeCurrentStageProcessAlert = () => {
    setError("네트워크 오류가 발생했습니다.");
  };

  const handleGameOver = useCallback(async () => {
    startLoading();
    await handleStageFailure();
    stopLoading();
    stopCountdown();
    setGameOver(true);
  }, [stopCountdown, setGameOver]);

  const handleRestartQuizStage = () => {
    resetCountdown();
    startCountdown();
    setLifeCount(defaultLifeCount);
    setGameOver(false);
    clearUserAnswerLogs();
    setCurrentQuestionIndex(0);
    resetSelectedOptionIds();
    setIsCorrectAnswer(false);
    stopAnimation();
    forceUpdate((prev) => prev + 1);
  };

  const handleGotoMap = () => {
    resetCountdown();
    setLifeCount(defaultLifeCount);
    setGameOver(false);
    router.push("map");
  };

  const handleRestartCountdown = useCallback(() => {
    resetCountdown();
    startCountdown();
  }, [resetCountdown, startCountdown]);

  const handleLifeDecrease = useCallback(() => {
    setLifeCount((prev) => prev - 1);
    handleRestartCountdown();
  }, [resetCountdown, setLifeCount, startCountdown]);

  return {
    // States
    currentQuestionIndex,
    lifeCount,
    gameOver,
    success,
    isCorrectAnswer,
    error,
    errorMessage,
    question,
    currentStageTotalQuestions,
    defaultLifeCount,

    // Countdown
    count,
    remainingTimeProgress,
    handleRestartCountdown,

    // Animation
    animationRef,
    getAnimateState,

    // Functions
    isOptionSelected,
    handleConfirmAnswer,
    handleGameOver,
    handleRestartQuizStage,
    handleGotoMap,
    handleLifeDecrease,

    setErrorMessage,
    setError,
    tryFinalizeCurrentStageProcess,
  };
};
