// 색 -> 투명으로 이어지는 그라데이션

import { cn, fixedClass } from "@/lib/utils";

// 투명 -> 색으로 이어지는 그라데이션
type GradientType = "color-to-transparent" | "transparent-to-color";
export default function Gradient({ type }: { type: GradientType }) {
  return (
    <div
      className={cn(
        "h-[220px] z-10 from-white/0 to-white",
        fixedClass,
        type === "color-to-transparent"
          ? "bg-gradient-to-t top-0 "
          : "bg-gradient-to-b bottom-0"
      )}
    />
  );
}
