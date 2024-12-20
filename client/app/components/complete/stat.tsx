import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

export default function Stat({ score }: { score: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView) return;

    animate(0, score, {
      duration: 1,
      onUpdate(value) {
        if (!ref.current) return;
        ref.current.textContent = value.toFixed(0);
      },
    });
  }, [score, isInView]);

  return (
    <h1 className="text-[50px] leading-normal" ref={ref}>
      {score}
    </h1>
  );
}
