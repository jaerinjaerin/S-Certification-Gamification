import { motion } from "motion/react";

const ANIMATION_PROPS = {
  initial: { translateX: "-100%" },
  animate: { translateX: "300%" },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

function HighlightMotionEffect({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...ANIMATION_PROPS} className="h-full px-2">
      {children}
    </motion.div>
  );
}

function HintOverlay() {
  return (
    <div className="h-full">
      <svg width="100%" height="100%" viewBox="0 0 201 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.741943" width="200" height="100%" transform="rotate(0.285261 0.741943 0)" fill="url(#hintGradient)" />
        <defs>
          <linearGradient id="hintGradient" x1="175.172" y1="34.132" x2="90.7222" y2="110.213" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C3E0F8" stopOpacity="0" />
            <stop offset="0.525" stopColor="#C3E0F8" stopOpacity="0.6" />
            <stop offset="1" stopColor="#C3E0F8" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function HintAnimation() {
  return (
    <div className="relative z-0 flex overflow-hidden h-full">
      <HighlightMotionEffect>
        <HintOverlay />
      </HighlightMotionEffect>
    </div>
  );
}
