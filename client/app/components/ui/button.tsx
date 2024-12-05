import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:offset-3 disabled:pointer-events-none disabled:opacity-50",
  // "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground font-bold",
        primary: "bg-foreground text-background font-bold rounded-full",

        // default: "bg-primary text-foreground shadow-sm hover:bg-primary/90", // hamburger, moveRoute button
        // primary: "bg-accent hover:bg-accent-foreground text-background dark:text-foreground", // login, submit button
        // primary: "bg-accent hover:bg-accent-foreground", // login, submit button
        // dialogPrimary: 'bg-accent hover:bg-foreground hover:text-background', // popup action button
        // outline: 'border-[2px] border-foreground hover:bg-foreground hover:text-background', // cancel button

        // destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        // secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        // ghost: 'hover:bg-primary hover:text-foreground',
        // link: 'underline-offset-4 hover:underline',
      },
      size: {
        default: "py-[22px] px-[34px]",
        icon: "h-5 w-5",
        // sm: 'h-8 rounded-md px-3 text-xs',
        // lg: 'h-10 rounded-md px-8',
        // submit: 'px-4 py-2 h-[50px]',
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});

Button.displayName = "Button";

export { Button, buttonVariants };
