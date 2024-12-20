import { motion } from "motion/react";
const LOOP_DURATION = 1.5;

export const ActivePointer = () => {
  return (
    <motion.span
      initial={{
        y: 0,
      }}
      animate={{
        y: [0, -10, 0, 10, 0],
      }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        duration: LOOP_DURATION,
        ease: "linear",
      }}
      className="absolute bottom-[-16px] right-[-16px] size-[65px] bg-contain bg-center"
      style={{ backgroundImage: `url('/assets/pointer.svg')` }}
    />
  );
};

export const Ping = () => {
  return (
    <div className="absolute top-1/2 left-1/2 translate-x-1/2">
      <AnimationCircle delay={0} />
      <AnimationCircle delay={LOOP_DURATION * 0.15} />
      <AnimationCircle delay={LOOP_DURATION * 0.35} />
      <AnimationCircle delay={LOOP_DURATION * 0.5} />
    </div>
  );
};

export const AnimationCircle = ({ delay }) => {
  return (
    <motion.span
      style={{
        translateX: "-50%",
        translateY: "-50%",
      }}
      initial={{
        opacity: 0.5,
        scale: 0.9,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: 1.5,
      }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        times: [0, 0.5, 0.75, 1],
        duration: LOOP_DURATION,
        ease: "linear",
        delay,
      }}
      className="absolute left-[50%] top-[50%] z-0 size-[130px] rounded-full border-[1px] border-[#5AAFFF4D] bg-gradient-to-br from-[#5AAFFF4D]/50 to-[#80B5FF80]/20 shadow-xl shadow-[#80B5FF80]/40"
    />
  );
};
