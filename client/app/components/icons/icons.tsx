import { IconProps } from "@/app/types/type";
import React from "react";

export const CloseIcon = React.forwardRef<SVGSVGElement, IconProps>(({ color = "currentColor", ...props }, forwardRef) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={forwardRef}>
      <path
        d="M16 1.61143L14.3886 0L8 6.38857L1.61143 0L0 1.61143L6.38857 8L0 14.3886L1.61143 16L8 9.61143L14.3886 16L16 14.3886L9.61143 8L16 1.61143Z"
        fill={color}
      />
    </svg>
  );
});

CloseIcon.displayName = "CloseIcon";

export const ChevronDownIcon = React.forwardRef<SVGSVGElement, IconProps>(({ color = "currentColor", ...props }, forwardRef) => {
  return (
    <svg width="20" height="30" viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={forwardRef}>
      <path d="M6.5 13L10 17L13.5 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

ChevronDownIcon.displayName = "ChevronDownIcon";

export const QuestionMark = React.forwardRef<SVGSVGElement, IconProps>(({ color = "currentColor", ...props }, forwardRef) => {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.67714 10.1679V9.96993C3.67714 5.59593 6.66514 6.11793 6.66514 3.95793C6.66514 3.03993 5.98114 2.35593 4.93714 2.35593C3.98314 2.35593 3.35314 3.02193 3.13714 3.90393L0.869141 3.12993C1.30114 1.41993 2.68714 0.231934 4.97314 0.231934C7.42114 0.231934 9.13114 1.72593 9.13114 3.99393C9.13114 7.41393 5.85514 6.67593 5.85514 9.96993V10.1679H3.67714ZM3.28114 12.3099C3.28114 11.4279 3.85714 10.8339 4.75714 10.8339C5.67514 10.8339 6.21514 11.4279 6.21514 12.3099C6.21514 13.1739 5.65714 13.7679 4.73914 13.7679C3.83914 13.7679 3.28114 13.1739 3.28114 12.3099Z"
        fill="#272727"
      />
    </svg>
  );
});

QuestionMark.displayName = "QuestionMark";
