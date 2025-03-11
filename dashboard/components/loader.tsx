import { Loader2 } from 'lucide-react';
import React, { HTMLAttributes } from 'react';

export const Loader = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props}>
      <Loader2 className="animate-spin text-zinc-600" />
    </div>
  );
};

export default Loader;

export const LoadingFullScreen = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <Loader
      className="fixed z-[9999] top-0 left-0 w-full h-full flex items-center justify-center bg-white"
      {...props}
    />
  );
};

export const LoaderWithBackground = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <Loader
      className="inset-0 z-[9999] absolute flex items-center justify-center bg-white/80 rounded-xl"
      {...props}
    />
  );
};
