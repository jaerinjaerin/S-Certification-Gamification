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
