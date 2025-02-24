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
import { useState } from 'react';

export default function InformationInputDialog({
  trigger,
  onOpenChange,
  open,
  type,
}: {
  trigger?: React.ReactNode;
  onOpenChange?: () => void;
  open?: boolean;
  type: 'single' | 'multi';
}) {
  const [isSuccess, setIsSuccess] = useState(false);

  const getResultMessage = () => {
    if (!isSuccess) {
      return 'The file upload has failed.';
    } else if (type === 'single') {
      return 'The file has been uploaded successfully.';
    } else if (type === 'multi') {
      return `Out of a total of ${32} files, ${27} files were successfully uploaded.`;
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
                  isSuccess ? 'bg-blue-100' : 'bg-red-100'
                )}
              >
                {isSuccess ? (
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
                5 files failed to upload.
              </span>
            </div>
            <div className="overflow-y-scroll max-h-[373px]">
              {/* <table className="border border-zinc-200 w-full">
                <thead className="border border-zinc-200">
                  <td>hi</td>
                  <td>hi</td>
                  <td>hi</td>
                </thead>
                <tbody className="border border-zinc-200 ">
                  <tr className="h-60">
                    <td>hello</td>
                    <td>hello</td>
                    <td>hello</td>
                  </tr>
                  <tr className="h-60">
                    <td>yellow</td>
                    <td>green</td>
                    <td>red</td>
                  </tr>
                </tbody>
              </table> */}
            </div>
          </div>
        )}

        <DialogFooter className="!justify-center">
          <DialogClose asChild>
            <Button className="shadow-none" variant={'action'}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
