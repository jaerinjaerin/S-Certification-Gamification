import { motion } from "motion/react";
import { QuestionOption } from "@prisma/client";
import { cn } from "@/utils/utils";
import { HintAnimation } from "./animations";
import { QuestionEx } from "@/types/apiTypes";

interface QuizOptionsProps {
  options: QuestionOption[];
  isCorrectAnswer: boolean;
  isOptionSelected: (optionId: string) => boolean;
  handleConfirmAnswer?: (question: QuestionEx, optionId: string) => void;
  getAnimateState?: (option: QuestionOption) => any;
  animationRef?: React.MutableRefObject<boolean | null>;
  isArabicLocale: boolean;
  isMyanmar: boolean;
  question: QuestionEx;
  isQuiz?: boolean;
}

const motionProps = {
  initial: { backgroundColor: "#FFFFFF", color: "#0F0F0F" },
  transition: { duration: 0.5, ease: "easeInOut" },
};

export const QuizOptions = ({
  options,
  isCorrectAnswer,
  isOptionSelected,
  handleConfirmAnswer,
  getAnimateState,
  animationRef,
  isArabicLocale,
  isMyanmar,
  question,
  isQuiz = true,
}: QuizOptionsProps) => {
  const sortedOptions = [...options].sort((a, b) => a.order - b.order);

  return (
    <div className="pt-[32px] pb-[48px] px-5 flex flex-col gap-4">
      {sortedOptions.map((option: QuestionOption) => {
        const isSelected = isOptionSelected(option.id);
        const isDevEnv = process.env.NODE_ENV !== "production";

        return (
          <motion.label
            key={option.id}
            onClick={() => {
              handleConfirmAnswer?.(question, option.id);
            }}
            className={cn(
              "relative rounded-[20px] py-4 px-6 hover:cursor-pointer font-one font-semibold text-lg overflow-hidden",
              isCorrectAnswer && "pointer-events-none",
              isSelected && "pointer-events-none",
              isArabicLocale && "text-right",
              isMyanmar && "leading-loose"
            )}
            {...motionProps}
            animate={getAnimateState ? getAnimateState(option) : {}}
          >
            {option.text}
            {isDevEnv && <span>({option.isCorrect ? "o" : "x"})</span>}
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              className="hidden"
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
            {isQuiz && option.isCorrect && animationRef?.current && (
              <div className={cn("absolute w-full h-full top-0 left-0 rounded-[20px]")}>
                <HintAnimation />
              </div>
            )}
          </motion.label>
        );
      })}
    </div>
  );
};
