import { useState, useEffect } from "react";
import { useInterval } from "usehooks-ts";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";

export function TypewriteTextVer({ question }: { question: string }) {
  const [letterIndex, setLetterIndex] = useState(0);
  const [letter, setLetter] = useState("");
  const SWAP_DELAY_IN_MS = 20;
  const path = usePathname();
  const QUIZ_PATH = path.includes("quiz");

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
    <div className="font-one text-lg font-bold">
      {QUIZ_PATH ? letter : question}
      {QUIZ_PATH && letterIndex !== question.length && (
        <motion.span className="ml-1">|</motion.span>
      )}
    </div>
  );
}
