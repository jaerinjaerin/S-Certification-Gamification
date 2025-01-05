"use client";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

type Props = { children: React.ReactNode };

const ContentWithTitleSection = ({ children }: Props) => {
  const path = usePathname();

  const segment = useMemo(() => {
    let lastPath = path.split("/").pop();
    if (lastPath === "overview") {
      lastPath = "dashboard";
    }
    return lastPath;
  }, [path]);

  return (
    <div>
      <div>
        <div className="font-extrabold text-size-24px capitalize">
          {segment}
        </div>
        <div>
          {"You can see the overall user status and quiz status at a glance."}
        </div>
        <div className="w-full border-b my-5 border-zinc-200" />
      </div>
      <div>{children}</div>
    </div>
  );
};

export default ContentWithTitleSection;
