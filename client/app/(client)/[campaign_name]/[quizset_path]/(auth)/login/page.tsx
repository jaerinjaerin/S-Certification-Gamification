"use client";
import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import useLoader from "@/app/components/ui/loader";
import Spinner from "@/app/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { cn, fixedClass } from "@/utils/utils";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function Login() {
  const { status } = useSession();
  const translation = useTranslations();
  const params = useParams<{ campaign_name: string; quizset_path: string }>();
  const pathLanguageCode = params.quizset_path.split("_").at(-1);
  const { loading, setLoading } = useLoader();

  // const videoMp4Url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/videos/bg.mp4`;
  // const videoWebmUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/videos/bg.webm`;

  // const isValidLocale = (code: string | undefined): code is Locale =>
  //   locales.includes(code as Locale);

  // useEffect(() => {
  //   setLoading(true);
  //   if (!pathLanguageCode) return;

  //   if (isValidLocale(pathLanguageCode)) {
  //     // setPathLocale({ path: pathLanguageCode });
  //   }
  //   setLoading(false);
  // }, []);

  if (status === "loading") {
    return <Spinner />;
  }

  return (
    <>
      <div className={cn("h-svh", fixedClass)}>
        {/* <video
          className="w-full h-svh object-fill absolute "
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoMp4Url} type="video/mp4" />
          <source src={videoWebmUrl} type="video/webm" />
        </video> */}
        <div
          className="w-full h-svh object-fill absolute"
          style={{
            backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/background/main_bg2.jpg')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        <div className="flex flex-col items-center h-full py-[20px] relative">
          <span className="block font-extrabold">
            {translation("galaxy_ai_expert")}
          </span>
          <LoginTitle className="my-auto" />
          <PrivacyAndTerm />
        </div>
        {loading && <Spinner />}
      </div>
    </>
  );
}

const LoginTitle = ({ className }: { className?: string }) => {
  const translation = useTranslations();
  const { loading, setLoading } = useLoader();
  const processSignIn = async () => {
    setLoading(true);
    const result = await signIn("sumtotal");
    console.log("result", result);
  };

  return (
    <>
      <div className={cn("flex flex-col items-center", className)}>
        <div className="mb-[70px]">
          <span
            className="block font-extrabold text-[44px] text-center mb-5 leading-normal"
            style={{ wordBreak: "break-word" }}
          >
            {translation("be_a_galaxy_ai_expert")}
          </span>
          <span className="block text-[30px] font-medium text-center uppercase">
            {translation("certification")}
          </span>
        </div>
        <Button
          variant={"primary"}
          onClick={() => processSignIn()}
          className="font-extrabold text-[18px] disabled:bg-disabled"
          disabled={loading}
        >
          S+ {translation("login")}
        </Button>
      </div>
    </>
  );
};
