"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  // BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Slash } from "lucide-react";
import { cn } from "@/lib/utils";

const CurrentBreadCrumb = () => {
  const pathname = usePathname();
  const paths = pathname
    .split("/")
    .filter(Boolean)
    .map((name) => name.replaceAll("-", " "));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem
                className={cn([
                  index !== paths.length - 1
                    ? "text-zinc-500"
                    : "text-zinc-950",
                  item.toLowerCase() === "cms" ? "uppercase" : "capitalize",
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
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CurrentBreadCrumb;
