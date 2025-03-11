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
import { ProcessResult } from '@/lib/quiz-excel-parser';
import { cn } from '@/utils/utils';
import { X, Check } from 'lucide-react';

// import {
//   FilesTableComponent,
//   Td,
// } from '../../set-quiz/_components/files-table-component';
import { isEmpty } from '../../_utils/utils';

type UploadFilesResult = ProcessResult | any; // TODO: fix type

interface UploadResultDialogProps {
  uploadFilesResult: UploadFilesResult[];
  onOpenChange?: () => void;
  open?: boolean;
}

export default function UploadResultDialog({
  uploadFilesResult,
  onOpenChange,
  open,
}: UploadResultDialogProps) {
  console.log('🥕 uploadFilesResult', uploadFilesResult);
  const renderResultIcon = () => {
    const hasSuccessfulUploads = !isEmpty(uploadFilesResult);
    const iconContainerClasses = cn(
      'rounded-full size-11 flex items-center justify-center',
      hasSuccessfulUploads ? 'bg-blue-100' : 'bg-red-100'
    );
    const ResultIcon = hasSuccessfulUploads ? Check : X;
    const iconColorClass = hasSuccessfulUploads
      ? 'text-icon-success'
      : 'text-icon-error';

    return (
      <div className={iconContainerClasses}>
        <ResultIcon className={iconColorClass} />
      </div>
    );
  };

  const renderResultMessage = () => {
    return (
      <span className="text-size-14px font-semibold">
        {!isEmpty(uploadFilesResult)
          ? 'The file has been uploaded successfully.'
          : 'The file upload has failed.'}
      </span>
    );
  };

  const getErrorMessage = (item: any) => {
    if (
      'errors' in item &&
      Array.isArray(item.errors) &&
      item.errors.length > 0
    ) {
      return item.errors[0].message;
    }
    if ('error' in item && item.error?.message) {
      return item.error.message.split(':')[1];
    }
    return 'Unknown error';
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <CustomDialogContent
        className="flex-col gap-16"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-col text-left gap-16">
          <DialogTitle className="text-size-17px font-semibold">
            Upload Result
          </DialogTitle>
          <DialogDescription
            asChild
            className="!mt-0 text-size-14px font-medium flex flex-col justify-center items-center gap-[1.688rem]"
          >
            <div>
              <div>{renderResultIcon()}</div>
              <span>{renderResultMessage()}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="!justify-center">
          <DialogClose asChild>
            <Button
              className="shadow-none"
              variant={'action'}
              onClick={onOpenChange}
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
