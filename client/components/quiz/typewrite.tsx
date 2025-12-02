import { useState, useEffect } from "react";
import { useInterval } from "usehooks-ts";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";
import useCheckLocale from "@/hooks/useCheckLocale";

export function TypewriteTextVer({
  question,
  isArabicCountry,
}: {
  question: string;
  isArabicCountry: boolean;
}) {
  const [letterIndex, setLetterIndex] = useState(0);
  const [letter, setLetter] = useState("");
  const SWAP_DELAY_IN_MS = 20;
  const path = usePathname();
  const QUIZ_PATH = path.includes("quiz");
  const { isMyanmar } = useCheckLocale();

  const init = () => {
    setLetter("");
    setLetterIndex(0);
  };

  useEffect(() => {
    init();
  }, [question]);

  const letterInterval = () => {
    if (letterIndex < question.length) {
      setLetter((prev) => `${prev}${question[letterIndex]}`);
      setLetterIndex((prev) => prev + 1);
    }
  };

  useInterval(
    letterInterval,
    letterIndex < question.length ? SWAP_DELAY_IN_MS : null
  );

  return (
    <div
      className={cn(
        "text-lg font-bold font-one break-words",
        isArabicCountry && "text-right",
        isMyanmar && "leading-loose"
      )}
    >
      {QUIZ_PATH ? letter : question}
      {QUIZ_PATH && letterIndex !== question.length && (
        <motion.span className="ml-1">|</motion.span>
      )}
    </div>
  );
}
