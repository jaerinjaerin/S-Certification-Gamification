"use client";

import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();

  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto text-base flex flex-col justify-center space-y-[19px]">
      <>
        <h1 className="text-xl text-center text-[#2686F5]">
          The network is unstable. Please try again later.
        </h1>
        <button
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </>
    </div>
  );
}
