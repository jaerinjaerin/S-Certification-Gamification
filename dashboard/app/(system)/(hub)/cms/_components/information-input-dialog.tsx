'use client';

import { Button } from '@/components/ui/button';
import {
  CustomDialogContent,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/utils/utils';
import { X, Check, CircleX } from 'lucide-react';

interface uploadData {
  totalLength: number;
  invalidLength: number;
}

export default function InformationInputDialog({
  trigger,
  onOpenChange,
  open,
  type,
  onClick,
  state,
  uploadData,
  tableContent,
}: {
  trigger?: React.ReactNode;
  onOpenChange?: () => void;
  open?: boolean;
  type: 'single' | 'multi';
  onClick?: () => void;
  state: 'error' | 'success';
  uploadData: uploadData[];
  tableContent?: React.ReactNode;
}) {
  // console.log('🍕uploadData', uploadData);
  const { totalLength, invalidLength } = uploadData[0];

  const getResultMessage = () => {
    if (state === 'error') {
      return 'The file upload has failed.';
    } else if (type === 'single') {
      return 'The file has been uploaded successfully.';
    } else if (type === 'multi') {
      return `Out of a total of ${totalLength} files, ${totalLength - invalidLength} files were successfully uploaded.`;
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <CustomDialogContent className="flex-col gap-16">
        <DialogHeader className="flex-col text-left gap-16">
          <DialogTitle className="text-size-17px font-semibold">
            Upload Result
          </DialogTitle>
          <DialogDescription
            asChild
            className="!mt-0 text-size-14px font-medium flex flex-col justify-center items-center gap-[1.688rem]"
          >
            <div>
              <div
                className={cn(
                  `rounded-full size-11 flex items-center justify-center`,
                  state === 'success' ? 'bg-blue-100' : 'bg-red-100'
                )}
              >
                {state === 'success' ? (
                  <Check className="text-icon-success" />
                ) : (
                  <X className="text-icon-error" />
                )}
              </div>
              <span>{getResultMessage()}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {type === 'multi' && (
          <div className="flex flex-col gap-5">
            <div className="flex gap-2 items-center">
              <CircleX strokeWidth={3} className="size-[0.813rem] font-bold" />
              <span className="text-size-14px font-semibold">
                {invalidLength} files failed to upload.
              </span>
            </div>
            <div className="overflow-y-scroll max-h-[373px] border border-zinc-200 rounded-md">
              {tableContent}
            </div>
          </div>
        )}

        <DialogFooter className="!justify-center">
          <DialogClose asChild>
            <Button
              className="shadow-none"
              variant={'action'}
              onClick={onClick}
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
