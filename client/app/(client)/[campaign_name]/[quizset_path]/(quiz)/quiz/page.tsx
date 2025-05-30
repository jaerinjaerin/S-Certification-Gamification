"use client";

// React
import { useEffect } from "react";

// Next
import { redirect, useRouter } from "next/navigation";

// Next-intl
import { useTranslations } from "next-intl";

// Components
import { ResultAlertDialog } from "@/components/dialog/result-alert-dialog";
import { GameOverAlertDialog } from "@/components/quiz/alert-dialog";
import Qusetion from "@/components/quiz/question-area";
import SuccessNotify from "@/components/quiz/success-notify";
import useLoader from "@/components/ui/loader";
import { QuizHeader, QuizOptions } from "@/components/quiz";

// Constants
import { arabicDomains } from "@/core/config/default";

// Hooks
import useGAPageView from "@/core/monitoring/ga/usePageView";
import useCheckLocale from "@/hooks/useCheckLocale";
import { useCheckOS } from "@/hooks/useCheckOS";
import { useQuizGame } from "@/hooks/quiz/useQuizGame";

// Providers
import { useCampaign } from "@/providers/campaignProvider";
import { useQuiz } from "@/providers/quizProvider";

export default function QuizPage() {
  useGAPageView();

  const translation = useTranslations();
  const router = useRouter();
  const {
    currentQuestionIndex: questionIndexFromContext,
    currentQuizStage: quizStageFromContext,
    currentStageQuestions: stageQuestionsFromContext,
    isComplete,
    finalizeCurrentStage,
    handleStageFailure,
    logUserAnswer,
    clearUserAnswerLogs,
  } = useQuiz();

  const { campaign } = useCampaign();
  const { Loader, startLoading, stopLoading } = useLoader();
  const { isMyanmar, isArabic } = useCheckLocale();
  const { isAndroid, isWindows } = useCheckOS();

  const isArabicCountry = arabicDomains.includes(campaign.name);
  const isArabicLocale = campaign.name.toLowerCase() === "s25" ? isArabic : isArabicCountry;

  if (!quizStageFromContext) {
    redirect("map");
  }

  // 게임에 필요한 로직들을 분리하여 컴포넌트에서는 함수만 호출하도록 함
  const {
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
    handleRestartCountdown,
  } = useQuizGame({
    currentQuizStage: quizStageFromContext,
    currentStageQuestions: stageQuestionsFromContext,
    questionIndexFromContext,
    finalizeCurrentStage,
    handleStageFailure,
    logUserAnswer,
    clearUserAnswerLogs,
    startLoading,
    stopLoading,
  });

  useEffect(() => {
    startLoading();

    // 퀴즈를 완료한 후에 퀴즈 페이지 진입 시, Map페이지로 이동
    if (isComplete()) {
      router.push("map");
      return;
    }

    stopLoading();
  }, []);

  useEffect(() => {
    handleRestartCountdown();
  }, [currentQuestionIndex, handleRestartCountdown]);

  useEffect(() => {
    if (count <= 0) {
      handleLifeDecrease();
    }
  }, [count, handleLifeDecrease]);

  useEffect(() => {
    if (lifeCount === 0) {
      handleGameOver();
    }
  }, [lifeCount, handleGameOver]);

  return (
    <div className="min-h-svh bg-slate-300/20">
      <QuizHeader
        currentQuestionIndex={currentQuestionIndex}
        currentStageTotalQuestions={currentStageTotalQuestions}
        defaultLifeCount={defaultLifeCount}
        lifeCount={lifeCount}
        remainingTimeProgress={remainingTimeProgress}
        isWindows={isWindows}
        isAndroid={isAndroid}
        translation={translation}
      />
      <Qusetion
        isArabicCountry={isArabicLocale}
        question={question.text}
        bgImageUrl={
          question.backgroundImage?.imagePath
            ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.backgroundImage.imagePath}`
            : `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/bg_1.jpg`
        }
        charImageUrl={
          question.characterImage?.imagePath
            ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.characterImage.imagePath}`
            : `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/character/stage1_1.png`
        }
      />
      <QuizOptions
        options={question.options}
        isCorrectAnswer={isCorrectAnswer}
        isOptionSelected={isOptionSelected}
        handleConfirmAnswer={handleConfirmAnswer}
        getAnimateState={getAnimateState}
        animationRef={animationRef}
        isArabicLocale={isArabicLocale}
        isMyanmar={isMyanmar}
        question={question}
      />

      {success && <SuccessNotify />}
      {Loader()}

      <GameOverAlertDialog gameOver={gameOver} onRestart={handleRestartQuizStage} onGotoMap={handleGotoMap} />
      <ResultAlertDialog
        open={!!errorMessage}
        description={errorMessage}
        onConfirm={() => () => router.push("map")}
        confirmText={translation("back")}
      />

      <ResultAlertDialog
        open={!!error}
        description={error}
        onConfirm={() => {
          setErrorMessage(null);
          finalizeCurrentStage(lifeCount);
        }}
        confirmText={translation("ok")}
      />
    </div>
  );
}
