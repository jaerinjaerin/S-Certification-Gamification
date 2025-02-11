"use client";

import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();

  return (
    <div
      className="h-full bg-[#F0F0F0] w-full min-h-svh mx-auto text-base flex flex-col justify-center space-y-[19px]"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/bg_main2.jpg')`,
      }}
    >
      <h1 className="text-xl text-center text-[#2686F5]">
        The network is unstable. Please try again later.
      </h1>
      <button
        onClick={() => router.refresh()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Retry
      </button>
    </div>
  );
}
