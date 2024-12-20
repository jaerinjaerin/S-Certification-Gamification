import { useState, useEffect } from "react";
import { useInterval } from "usehooks-ts";
import { motion } from "motion/react";

export function Typewrite({ question }: { question: string }) {
  const [letterIndex, setLetterIndex] = useState(0);
  const [letter, setLetter] = useState("");
  const words = question.split(" ");
  const SWAP_DELAY_IN_MS = 90;

  const init = () => {
    setLetter("");
    setLetterIndex(0);
  };

  useEffect(() => {
    init();
  }, [question]);

  const letterInterval = () => {
    if (letterIndex < words.length) {
      setLetter((prev) => `${prev} ${words[letterIndex]}`);
      setLetterIndex((prev) => prev + 1);
    }
  };

  useInterval(letterInterval, letterIndex < words.length ? SWAP_DELAY_IN_MS : null);

  return (
    <div className="">
      {letter}
      <motion.span
        className="ml-1"
        initial={{ opacity: 1 }}
        animate={letterIndex === words.length ? { opacity: [1, 0, 1] } : { opacity: 1 }}
        transition={
          letterIndex === words.length
            ? {
                repeat: Infinity,
                duration: 1.8,
              }
            : undefined
        }
      >
        |
      </motion.span>
    </div>
  );
}

export function TypewriteTextVer({ question }: { question: string }) {
  const [letterIndex, setLetterIndex] = useState(0);
  const [letter, setLetter] = useState("");
  const SWAP_DELAY_IN_MS = 20;

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

  useInterval(letterInterval, letterIndex < question.length ? SWAP_DELAY_IN_MS : null);

  return (
    <div className="">
      {letter}
      <motion.span
        className="ml-1"
        initial={{ opacity: 1 }}
        animate={letterIndex === question.length ? { opacity: [1, 0, 1] } : { opacity: 1 }}
        transition={
          letterIndex === question.length
            ? {
                repeat: Infinity,
                duration: 1.8,
              }
            : undefined
        }
      >
        |
      </motion.span>
    </div>
  );
}
