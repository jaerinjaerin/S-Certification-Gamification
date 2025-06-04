import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionEx, QuizStageEx } from "@/types/apiTypes";
import { QUIZ_CONSTANTS } from "@/constants/quiz";
import { sleep } from "@/utils/utils";
import { useQuizAnimation } from "./useQuizAnimation";
import { useCountdown } from "@/hooks/useCountdown";
import { EndStageResult } from "@/types/type";
import { useTranslations } from "next-intl";

interface UseQuizGameProps {
  questionIndexFromContext: number;
  quizStageFromContext: QuizStageEx;
  stageQuestionsFromContext: QuestionEx[];
  finalizeCurrentStage: (lifeCount: number) => Promise<EndStageResult>;
  handleStageFailure: () => Promise<void>;
  logUserAnswer: (questionId: string, selectedOptionIds: string[], elapsedSeconds: number, isCorrect: boolean) => void;
  clearUserAnswerLogs: () => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useQuizGame = ({
  questionIndexFromContext,
  quizStageFromContext,
  stageQuestionsFromContext,
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
  // 최초 렌더링 시점에서 한 번만 값 가져오기
  const [currentQuizStage] = useState<QuizStageEx>(quizStageFromContext);
  const [currentStageQuestions] = useState<QuestionEx[]>(stageQuestionsFromContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(questionIndexFromContext);

  const defaultLifeCount = currentQuizStage.lifeCount ?? QUIZ_CONSTANTS.LIFE.DEFAULT_COUNT;
  const [lifeCount, setLifeCount] = useState<number>(defaultLifeCount);
  const [gameOver, setGameOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);
  const translation = useTranslations();

  // Derived values
  const question: QuestionEx = currentStageQuestions[currentQuestionIndex];
  const currentStageTotalQuestions = currentStageQuestions?.length;

  // Countdown
  const timeLimitSeconds = question.timeLimitSeconds ?? 30;
  const [count, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: timeLimitSeconds,
  });
  const remainingTimeProgress = (count / timeLimitSeconds) * QUIZ_CONSTANTS.PROGRESS.MAX;

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
    const elapsedSeconds = timeLimitSeconds - count;

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
    console.log("finalizeCurrentStage", lifeCount);
    tryFinalizeCurrentStageProcess(lifeCount);
  };

  const canNextQuestion = (): boolean => {
    return currentQuestionIndex + 1 < currentStageTotalQuestions;
  };

  const nextQuestion = (): void => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  /**
   * useStage로 연결되어 있는 값들은 초기화하지 않음. Complete 페이지에서 초기화 진행함.
   * 이유: useStage에 연결되어 있는 값을 초기화하면 Complete 화면으로 넘어가기 전에 UI가 초기화되어 다음 퀴즈가 잠깐 보여지는 문제가 있음
   */
  const tryFinalizeCurrentStageProcess = async (lifeCount: number) => {
    try {
      await finalizeCurrentStage(lifeCount); // 남은 하트수
      resetSelectedOptionIds();
      router.push("complete");
    } catch (error) {
      console.error("fail retFyfinalizeProcess", error);
      showFinalizeCurrentStageProcessAlert();
    }
  };

  const showFinalizeCurrentStageProcessAlert = () => {
    // confirm("퀴즈 스테이지를 종료하는데 실패했습니다. 다시 시도해 주세요.");
    setError(translation("network_error"));
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
