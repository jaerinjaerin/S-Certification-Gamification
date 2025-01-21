import { Loader2 } from "lucide-react";
import React from "react";

const Loader = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props}>
      <Loader2 className="animate-spin text-zinc-600" />
    </div>
  );
};

export default Loader;

export const LoaderWithBackground = () => {
  return (
    <Loader className="inset-0 absolute flex items-center justify-center bg-white/80" />
  );
};
