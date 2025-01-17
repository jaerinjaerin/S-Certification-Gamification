"use client";

import { Button } from "@/components/ui/button";
import useLoader from "@/components/ui/loader";
import Spinner from "@/components/ui/spinner";
import useGAPageView from "@/core/monitoring/ga/usePageView";
import useArabic from "@/hooks/useArabic";
import { cn } from "@/utils/utils";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function Login() {
  useGAPageView();
  const { status } = useSession();
  const translation = useTranslations();
  const { isArabic } = useArabic();
  // const locale = useLocale();

  const { loading, setLoading, renderLoader } = useLoader();
  const processSignIn = async () => {
    setLoading(true);
    const result = await signIn("sumtotal");
    console.log("result", result);
  };

  if (status === "loading") {
    return <Spinner />;
  }

  return (
    <>
      <div className={cn("h-svh")}>
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
          className="object-fill w-full h-svh"
          style={{
            backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/background/main_bg2.jpg')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col items-center h-full py-[20px] relative">
            <span className="block text-lg font-bold">
              {translation("galaxy_ai_expert")}
            </span>
            <div className={cn("flex flex-col items-center my-auto px-[30px]")}>
              <span className="block font-bold text-center text-4xl/normal sm:text-5xl/normal text-pretty">
                {translation("be_a_galaxy_ai_expert")}
              </span>
              {/* <span className="block text-center uppercase font-normal text-3xl/normal mt-[26px] mb-[69px]">
                {translation("certification")}
              </span> */}

              <Button
                variant={"primary"}
                onClick={() => processSignIn()}
                className={cn(
                  "disabled:bg-disabled mt-[49px]",
                  isArabic && "flex-row-reverse"
                )}
                disabled={loading}
              >
                <span>S+</span>
                <span>{translation("login")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {loading && renderLoader()}
    </>
  );
}
