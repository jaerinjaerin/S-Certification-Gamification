// import { SpinnerIcon } from "@/app/components/icons/icons";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
export default function Spinner() {
  // const colors = ["#251537", "#29309b", "#5ba3d9", "#92A7FE", "#6381F8"];

  return (
    <div className="absolute top-0 left-0 z-50 w-full h-screen bg-black/30 flex justify-center items-center">
      <div className="relative flex flex-col items-center justify-center">
        <DotLottieReact
          className="w-[200px] h-auto"
          src="https://lottie.host/c4ad8839-e3fc-453d-a4f7-19309d48a436/5wPsDF0ury.lottie"
          loop
          autoplay
        />
        {/* <span className="animate-loading">
          <SpinnerIcon className="size-8" />
        </span> */}
      </div>
    </div>
  );
}
