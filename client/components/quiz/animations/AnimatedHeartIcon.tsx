import { motion } from "motion/react";

type AnimatedHeartIconProps = {
  lifeCount: number;
  defaultLifeCount: number;
};

type HeartIconProps = {
  type: "filled" | "stroke";
};

export function AnimatedHeartIcon({ lifeCount, defaultLifeCount }: AnimatedHeartIconProps) {
  return (
    <>
      {Array.from({ length: defaultLifeCount }).map((_, index) => {
        const isFilled = index < lifeCount;
        return isFilled ? <HeartIcon type="filled" key={index} /> : <HeartIcon type="stroke" key={index} />;
      })}
    </>
  );
}

const HeartIcon = ({ type }: HeartIconProps) => {
  const isFilled = type === "filled";

  const pathData = isFilled
    ? "M9.16039 1.95783C7.32765 -0.1848 4.27143 -0.761161 1.97514 1.20085C-0.32116 3.16285 -0.644446 6.44323 1.15885 8.7637C2.65817 10.693 7.19562 14.7621 8.68276 16.0791C8.84914 16.2264 8.93233 16.3001 9.02936 16.3291C9.11405 16.3543 9.20672 16.3543 9.29142 16.3291C9.38845 16.3001 9.47164 16.2264 9.63802 16.0791C11.1252 14.7621 15.6626 10.693 17.1619 8.7637C18.9652 6.44323 18.6814 3.14221 16.3456 1.20085C14.0099 -0.740523 10.9931 -0.1848 9.16039 1.95783Z"
    : "M10.1604 3.30573C8.32765 1.1631 5.27143 0.586739 2.97514 2.54875C0.67884 4.51075 0.355554 7.79113 2.15885 10.1116C3.65817 12.0409 8.19562 16.11 9.68276 17.427C9.84914 17.5743 9.93233 17.648 10.0294 17.677C10.1141 17.7022 10.2067 17.7022 10.2914 17.677C10.3885 17.648 10.4716 17.5743 10.638 17.427C12.1252 16.11 16.6626 12.0409 18.1619 10.1116C19.9652 7.79113 19.6814 4.49011 17.3456 2.54875C15.0099 0.607378 11.9931 1.1631 10.1604 3.30573Z";

  const commonProps = {
    className: "size-4",
    xmlns: "http://www.w3.org/2000/svg",
    width: isFilled ? 19 : 20,
    height: isFilled ? 17 : 19,
    viewBox: isFilled ? "0 0 19 17" : "0 0 20 19",
    initial: { scale: 1 },
    animate: isFilled ? { scale: [1, 1.2, 1] } : { scale: [1, 1.5, 1], opacity: [1, 0.8, 1] },
    transition: {
      duration: isFilled ? 0.5 : 0.3,
      ease: "easeInOut",
    },
  };

  return (
    <motion.svg {...commonProps}>
      <motion.path
        d={pathData}
        fillRule="evenodd"
        clipRule="evenodd"
        fill={isFilled ? "#EE3434" : "none"}
        stroke={isFilled ? undefined : "#EE3434"}
        strokeLinecap={isFilled ? undefined : "round"}
        strokeLinejoin={isFilled ? undefined : "round"}
      />
    </motion.svg>
  );
};
