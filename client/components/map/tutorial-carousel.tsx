import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { useTranslations } from "next-intl";
import useCheckLocale from "@/hooks/useCheckLocale";
import { cn } from "@/utils/utils";

export default function TutorialCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const translation = useTranslations();
  const { isArabic, isMyanmar } = useCheckLocale();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const mapGuideImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/map_guide.png`;

  return (
    <Carousel className="w-full font-medium font-one" setApi={setApi}>
      <CarouselContent>
        {Array.from({ length: 2 }).map((_, index) => {
          return (
            <CarouselItem
              key={index}
              className={cn(current === index ? "w-full" : "w-0")}
            >
              <div className="h-full relative max-w-[300px]">
                {index === 0 && (
                  <div
                    className={cn(
                      " max-h-[320px] h-full overflow-y-scroll relative",
                      "bg-[#EDEDED] rounded-[20px] text-[#4E4E4E] p-4 py-5",
                      "flex flex-col"
                    )}
                  >
                    <p
                      className={cn(
                        "text-right w-[70%] ",
                        isMyanmar && "text-sm/loose"
                      )}
                    >
                      {translation("attempts_deduction")}
                    </p>

                    <div
                      className="w-full h-[160px] shrink-0 -mt-[50px] sm:-mt-[22px] "
                      style={{
                        backgroundImage: `url(${mapGuideImageUrl})`,
                        backgroundPosition: "center",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                      }}
                    ></div>

                    <p
                      className={cn(
                        "ml-[42px] sm:ml-[62px] -mt-[40px] sm:-mt-[15px] text-sm text-pretty",
                        isMyanmar && "text-sm/loose"
                      )}
                    >
                      {translation("time_limit_per_quiz")}
                    </p>
                  </div>
                )}
                {index === 1 && (
                  <ol
                    className={cn(
                      "bg-[#EDEDED] max-h-[320px] overflow-y-scroll h-full rounded-[20px] pl-8 pr-4 py-5 list-disc text-sm text-[#4E4E4E] flex flex-col gap-[26px] rtl:pl-4 rtl:pr-8 text-balance",
                      "text-sm carousel-content",
                      isMyanmar && "text-sm/loose"
                    )}
                    style={{ wordBreak: "break-word" }}
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    <li>{translation("you_have_5_attemps")}</li>
                    <li>{translation("giveup_or_interrupt_quiz")}</li>
                    <li>{translation("answer_first_attempt")}</li>
                  </ol>
                )}
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-[10px]">
        {Array.from({ length: 2 }).map((_, index) => {
          return (
            <div
              key={index}
              className={cn(
                "bg-black/30 size-2 text-white rounded-full",
                current === index && "bg-black/100"
              )}
            />
          );
        })}
      </div>
    </Carousel>
  );
}
