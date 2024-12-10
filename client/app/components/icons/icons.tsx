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

export const HeartIcon = React.forwardRef<SVGSVGElement, IconProps>(({ ...props }, forwardRef) => {
  return (
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={forwardRef}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1604 3.30573C8.32765 1.1631 5.27143 0.586739 2.97514 2.54875C0.67884 4.51075 0.355554 7.79113 2.15885 10.1116C3.65817 12.0409 8.19562 16.11 9.68276 17.427C9.84914 17.5743 9.93233 17.648 10.0294 17.677C10.1141 17.7022 10.2067 17.7022 10.2914 17.677C10.3885 17.648 10.4716 17.5743 10.638 17.427C12.1252 16.11 16.6626 12.0409 18.1619 10.1116C19.9652 7.79113 19.6814 4.49011 17.3456 2.54875C15.0099 0.607378 11.9931 1.1631 10.1604 3.30573Z"
        stroke="#EE3434"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

HeartIcon.displayName = "HeartIcon";

export const HeartFilledIcon = React.forwardRef<SVGSVGElement, IconProps>(({ ...props }, forwardRef) => {
  return (
    <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={forwardRef}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.16039 1.95783C7.32765 -0.1848 4.27143 -0.761161 1.97514 1.20085C-0.32116 3.16285 -0.644446 6.44323 1.15885 8.7637C2.65817 10.693 7.19562 14.7621 8.68276 16.0791C8.84914 16.2264 8.93233 16.3001 9.02936 16.3291C9.11405 16.3543 9.20672 16.3543 9.29142 16.3291C9.38845 16.3001 9.47164 16.2264 9.63802 16.0791C11.1252 14.7621 15.6626 10.693 17.1619 8.7637C18.9652 6.44323 18.6814 3.14221 16.3456 1.20085C14.0099 -0.740523 10.9931 -0.1848 9.16039 1.95783Z"
        fill="#EE3434"
      />
    </svg>
  );
});

HeartFilledIcon.displayName = "HeartFilledIcon";
