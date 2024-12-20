import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useState } from "react";

export default function successNotify() {
  const [success, setSuccess] = useState(false);

  const renderSuccessLottie = () => {
    if (success)
      return (
        <div className="fixed top-0 left-0 z-50 w-full h-screen bg-black/60 flex justify-center items-center">
          <DotLottieReact
            src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/jsons/success.json`}
            className="w-[400px] h-auto"
            loop
            autoplay
          />
        </div>
      );
  };

  return {
    success,
    setSuccess,
    renderSuccessLottie,
  };
}
