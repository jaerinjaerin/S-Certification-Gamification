"use client";
import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import { Button } from "@/app/components/ui/button";
import useLoader from "@/app/components/ui/loader";
import Spinner from "@/app/components/ui/spinner";
import { cn, fixedClass } from "@/utils/utils";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function Login() {
  const { status } = useSession();
  const translation = useTranslations();

  if (status === "loading") {
    return <Spinner />;
  }

  return (
    <>
      <div className={cn("h-svh", fixedClass)}>
        {/* <video
          className="absolute object-fill w-full h-svh "
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoMp4Url} type="video/mp4" />
          <source src={videoWebmUrl} type="video/webm" />
        </video> */}
        <div
          className="absolute object-fill w-full h-svh"
          style={{
            backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/background/main_bg2.jpg')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        <div className="flex flex-col items-center h-full py-[20px] relative">
          <span className="block text-lg font-bold">
            {translation("galaxy_ai_expert")}
          </span>
          <LoginTitle className="my-auto" />
          <PrivacyAndTerm />
        </div>
      </div>
    </>
  );
}

const LoginTitle = ({ className }: { className?: string }) => {
  const translation = useTranslations();

  const { loading, setLoading, renderLoader } = useLoader();
  const processSignIn = async () => {
    setLoading(true);
    const result = await signIn("sumtotal");
    console.log("result", result);
  };

  return (
    <>
      <div className={cn("flex flex-col items-center", className)}>
        <div>
          <span
            className="block font-bold text-center mx-[30px] text-5xl/normal"
            style={{ wordBreak: "break-word" }}
          >
            {translation("be_a_galaxy_ai_expert").replaceAll(
              "(Paradigm)",
              " S24"
            )}
          </span>
          <span className="block text-center uppercase font-normal text-3xl/normal mt-[26px] mb-[69px]">
            {translation("certification")}
          </span>
        </div>
        <Button
          variant={"primary"}
          onClick={() => processSignIn()}
          className="disabled:bg-disabled"
          disabled={loading}
        >
          {translation("login")}
        </Button>
        {loading && renderLoader()}
      </div>
    </>
  );
};
