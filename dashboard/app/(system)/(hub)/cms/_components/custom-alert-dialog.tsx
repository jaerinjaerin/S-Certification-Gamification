'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
  buttons: AlertButtonProps[];
}

interface AlertButtonProps {
  label: string;
  variant: ButtonProps['variant'];
  onClick?: () => void;
  type: 'cancel' | 'delete' | 'save' | 'ok';
}

export function CustomAlertDialog({
  onOpenChange,
  open,
  trigger,
  title = 'Alert',
  description,
  buttons,
}: AlertDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="p-4 gap-[34px] sm:rounded-md border border-zinc-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-medium text-left">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] text-zinc-500 text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="!flex-row !justify-center items-center !space-x-0 gap-3">
          {buttons.map((button, index) => {
            const { variant, onClick, label, type } = button;
            return type === 'cancel' ? (
              <AlertDialogCancel
                className={buttonVariants({ variant: variant })}
                onClick={onClick}
                key={index}
              >
                {label}
              </AlertDialogCancel>
            ) : (
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
