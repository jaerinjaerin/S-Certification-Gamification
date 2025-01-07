import { cn } from "@/utils/utils";

export default function CountDownBar({ progress }: { progress: number }) {
  return (
    <div className="bg-white relative h-[6px] w-full">
      <div
        className={cn(
          "bg-black w-full absolute top-0 left-0 h-[6px] z-[99999] transition-colors duration-300",
          progress < 30 && "bg-[#EE3434]"
        )}
        style={{
          width: `${progress}%`,
        }}
      ></div>
    </div>
  );
}
