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
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={forwardRef}>
      <path
        d="M3.67714 10.1679V9.96993C3.67714 5.59593 6.66514 6.11793 6.66514 3.95793C6.66514 3.03993 5.98114 2.35593 4.93714 2.35593C3.98314 2.35593 3.35314 3.02193 3.13714 3.90393L0.869141 3.12993C1.30114 1.41993 2.68714 0.231934 4.97314 0.231934C7.42114 0.231934 9.13114 1.72593 9.13114 3.99393C9.13114 7.41393 5.85514 6.67593 5.85514 9.96993V10.1679H3.67714ZM3.28114 12.3099C3.28114 11.4279 3.85714 10.8339 4.75714 10.8339C5.67514 10.8339 6.21514 11.4279 6.21514 12.3099C6.21514 13.1739 5.65714 13.7679 4.73914 13.7679C3.83914 13.7679 3.28114 13.1739 3.28114 12.3099Z"
        fill="#272727"
      />
    </svg>
  );
});

QuestionMark.displayName = "QuestionMark";

export const LockIcon = React.forwardRef<SVGSVGElement, IconProps>(({ color = "currentColor", ...props }, forwardRef) => {
  return (
    <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={forwardRef}>
      <path
        d="M8 16C8.53043 16 9.03914 15.7893 9.41421 15.4142C9.78929 15.0391 10 14.5304 10 14C10 12.89 9.1 12 8 12C7.46957 12 6.96086 12.2107 6.58579 12.5858C6.21071 12.9609 6 13.4696 6 14C6 14.5304 6.21071 15.0391 6.58579 15.4142C6.96086 15.7893 7.46957 16 8 16ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 7.89 0.9 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z"
        fill="#576581"
      />
    </svg>
  );
});

LockIcon.displayName = "LockIcon";

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
