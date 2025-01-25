"use client";
import { cn } from "@/lib/utils";
import { Slash } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  // BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

const CurrentBreadCrumb = () => {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem
              className={cn([
                index !== paths.length - 1 ? "text-zinc-500" : "text-zinc-950",
                "capitalize",
              ])}
            >
              {item}
            </BreadcrumbItem>
            {index < paths.length - 1 && ( // 마지막 아이템에는 Separator를 추가하지 않음
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CurrentBreadCrumb;
