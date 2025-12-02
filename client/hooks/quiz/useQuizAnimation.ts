import { useRef } from "react";
import { QUIZ_CONSTANTS } from "@/constants/quiz";
import { QuestionOption } from "@prisma/client";

type UseQuizAnimationProps = {
  isOptionSelected: (optionId: string) => boolean;
};

export const useQuizAnimation = ({ isOptionSelected }: UseQuizAnimationProps) => {
  const animationRef = useRef<boolean | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAnimation = () => {
    if (animationRef.current) return;

    animationRef.current = true;
    animationTimeoutRef.current = setTimeout(() => {
      stopAnimation();
    }, QUIZ_CONSTANTS.ANIMATION.DURATION);
  };

  const stopAnimation = () => {
    animationRef.current = false;
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  const getAnimateState = (option: QuestionOption) => {
    if (isOptionSelected(option.id)) {
      return {
        x: !option.isCorrect ? [0, -5, 5, -5, 5, 0] : 0,
        scale: !option.isCorrect ? 1 : [1, 1.1, 1],
        backgroundColor: option.isCorrect ? "#2686F5" : "#EE3434",
        color: "#ffffff",
        PointerEvent: "none" as const,
      };
    }

    return {
      x: 0,
      scale: 1,
    };
  };

  return {
    animationRef,
    triggerAnimation,
    stopAnimation,
    getAnimateState,
  };
};

// const animationRef = useRef<boolean | null>(null);
// const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// 애니메이션 중단
// const stopAnimation = () => {
//   animationRef.current = false; // 애니메이션 상태 초기화
//   if (animationTimeoutRef.current) {
//     clearTimeout(animationTimeoutRef.current);
//     animationTimeoutRef.current = null;
//   }
// };

// const getAnimateState = (option: QuestionOption) => {
//   if (isOptionSelected(option.id)) {
//     return {
//       x: !option.isCorrect ? [0, -5, 5, -5, 5, 0] : 0,
//       scale: !option.isCorrect ? 1 : [1, 1.1, 1],
//       backgroundColor: option.isCorrect ? "#2686F5" : "#EE3434",
//       color: "#ffffff",
//       PointerEvent: "none" as const,
//     };
//   }

//   return {
//     x: 0,
//     scale: 1,
//   };
// };

// 애니메이션 트리거
// const triggerAnimation = () => {
//   if (animationRef.current) return; // 이미 실행 중인 경우 방지

//   animationRef.current = true; // 애니메이션 실행 중
//   animationTimeoutRef.current = setTimeout(() => {
//     stopAnimation(); // 최대 2초 후 애니메이션 중단
//   }, QUIZ_CONSTANTS.ANIMATION.DURATION);
// };
