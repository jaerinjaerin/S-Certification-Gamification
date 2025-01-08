import { DotLottieReact } from "@lottiefiles/dotlottie-react";
export default function Spinner() {
  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-screen">
      <DotLottieReact
        src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/jsons/loading.json`}
        className="size-28 h-auto"
        autoplay
        loop
      />
    </div>
  );
}
