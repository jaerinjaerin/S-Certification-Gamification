'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ButtonProps, buttonVariants } from '@/components/ui/button';

interface AlertDialogProps {
  onOpenChange?: () => void;
  open?: boolean;
  trigger?: React.ReactNode;
  title?: string;
  description: string;
  buttons: {
    label: string;
    variant: ButtonProps['variant'];
    onClick?: () => void;
  }[];
}

export function CustomAlertDialog({
  onOpenChange,
  open,
  trigger,
  title,
  description,
  buttons,
}: AlertDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="p-4 gap-[34px] sm:rounded-md border border-zinc-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-medium text-left">
            {title ?? 'Alert'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] text-zinc-500 text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="!flex-row !justify-center items-center !space-x-0 gap-3">
          {buttons.map((button, index) => {
            const { variant, onClick, label } = button;
            return (
              <AlertDialogAction
                className={buttonVariants({ variant: variant })}
                onClick={onClick}
                key={index}
              >
                {label}
              </AlertDialogAction>
            );
          })}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
