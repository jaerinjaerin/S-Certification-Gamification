import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SuccessNotify() {
  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-screen">
      <DotLottieReact
        src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/common/jsons/success.json`}
        className="w-[400px] h-auto"
        autoplay
      />
    </div>
  );
}
