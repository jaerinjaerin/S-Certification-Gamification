"use client";

import useGAPageView from "@/core/monitoring/ga/usePageView";

export default function InvalidAccessPage() {
  useGAPageView();
  const notFoundImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/not-found-error.png`;
  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto text-base flex flex-col justify-center space-y-[19px]">
      <div
        className="w-full h-[208px]"
        style={{
          backgroundImage: `url(${notFoundImageUrl})`,
          backgroundPosition: "center",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
      />
      <h1 className="text-xl text-center text-[#2686F5]">Not-Found</h1>
    </div>
  );
}
