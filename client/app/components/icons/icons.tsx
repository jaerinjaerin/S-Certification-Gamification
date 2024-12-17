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

export const BluePaperAirplaneIcon = React.forwardRef<SVGSVGElement, IconProps>(({ ...props }, forwardRef) => {
  return (
    <svg width="50" height="38" viewBox="0 0 50 38" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={forwardRef}>
      <path
        d="M50 0L0 11.6756L12.0744 23.2942V38L21.4107 32.2783L27.1741 37.8247L50 0ZM42.9792 3.47226L13.0818 21.7956L3.59821 12.6692L42.9777 3.47226H42.9792ZM13.8467 34.8245V25.0011L20.0833 31.003L13.8467 34.826V34.8245ZM14.4077 23.0709L45.5015 4.01625L26.8036 35.0013L14.4077 23.0724V23.0709Z"
        fill="#1429A0"
      />
    </svg>
  );
});

BluePaperAirplaneIcon.displayName = "BluePaperAirplaneIcon";

export const SPlusIcon = React.forwardRef<SVGSVGElement, IconProps>(({ ...props }, forwardRef) => {
  return (
    <svg width="19" height="13" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={forwardRef}>
      <path
        d="M10.2273 2.01522C9.49799 2.48681 8.78307 2.94911 8.05723 3.41875C7.90609 3.27199 7.76873 3.12767 7.61701 2.99412C6.81129 2.28624 5.36938 2.048 4.3493 2.45061C3.71023 2.70304 3.3476 3.2984 3.48955 3.88251C3.59817 4.32867 3.99701 4.57229 4.43493 4.74205C4.98951 4.9573 5.5757 5.11335 6.14637 5.29974C6.84175 5.52673 7.5538 5.72486 8.22619 5.99441C11.3497 7.24678 10.91 10.2666 9.13996 11.6379C8.12677 12.423 6.91761 12.742 5.56363 12.7547C3.3522 12.7763 1.56087 12.0229 0.0873537 10.659C0.0620671 10.6355 0.0413781 10.6086 0 10.5626C0.798252 10.0255 1.59018 9.49222 2.37522 8.96339C2.68613 9.26572 2.96141 9.57735 3.28841 9.84298C4.21884 10.5988 5.7119 10.8067 6.75037 10.3395C7.42736 10.0352 7.73598 9.53185 7.72103 8.89588C7.70839 8.34015 7.24404 8.04516 6.73083 7.81817C6.39349 7.66896 6.02913 7.56084 5.66937 7.45322C4.92054 7.22965 4.16194 7.03006 3.41599 6.80062C2.37464 6.48068 1.5011 5.97093 1.01606 5.08987C0.22643 3.65454 0.856296 1.88656 2.45797 0.97566C3.74529 0.24332 5.16536 0.138141 6.64635 0.326974C8.067 0.508469 9.23076 1.09551 10.2273 2.01522Z"
        fill="white"
      />
      <path
        d="M16.3639 3.45056V5.54191H18.8379V7.45568H16.3725V9.58617H14.141V7.46987H11.6278V5.55414H14.1249V3.45056H16.3639Z"
        fill="white"
      />
    </svg>
  );
});

SPlusIcon.displayName = "SPlusIcon";

export const SpinnerIcon = React.forwardRef<SVGSVGElement, IconProps>(({ ...props }, forwardRef) => {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} ref={forwardRef}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M100 0C44.7715 0 0 44.7715 0 100C0 155.229 44.7715 200 100 200C155.229 200 200 155.229 200 100H180C180 144.183 144.183 180 100 180C55.8174 180 20 144.183 20 100C20 55.8171 55.8174 20 100 20V0Z"
        fill="black"
      />
    </svg>
  );
});

SpinnerIcon.displayName = "SpinnerIcon";
