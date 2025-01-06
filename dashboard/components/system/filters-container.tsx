import { cn } from "@/lib/utils";
import React from "react";

type Props = { className?: string; children: React.ReactNode };

const FiltersContainer = ({ className, children }: Props) => {
  return (
    <div
      className={cn(
        "bg-zinc-50 rounded-md p-6 gap-y-7",
        className && className
      )}
    >
      {children}
    </div>
  );
};

export default FiltersContainer;
