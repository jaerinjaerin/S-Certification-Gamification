import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function successNotify() {
  const renderSuccessLottie = () => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-screen flex justify-center items-center">
        <DotLottieReact
          src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/jsons/success.json`}
          className="w-[400px] h-auto"
          autoplay
        />
      </div>
    );
  };

  return {
    renderSuccessLottie,
  };
}
