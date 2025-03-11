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
} from '@/components/ui/dialog';
import { ProcessResult } from '@/lib/quiz-excel-parser';
import { cn } from '@/utils/utils';
import { Check, CircleAlert, CircleX, X } from 'lucide-react';
import {
  FilesTableComponent,
  Td,
} from '../set-quiz/_components/files-table-component';
import { UploadExcelFileVariant } from '../set-quiz/_type/type';
import { isEmpty } from '../_utils/utils';

type UploadFilesResult = ProcessResult | any; // TODO: fix type

interface UploadResultDialogProps {
  uploadFilesResult: UploadFilesResult[];
  onOpenChange: () => void;
  open: boolean;
  variant: UploadExcelFileVariant;
  isLoading: boolean;
  totalFiles: number;
}

export default function UploadResultDialog({
  uploadFilesResult,
  onOpenChange,
  open,
  variant,
  isLoading,
  totalFiles,
}: UploadResultDialogProps) {
  const renderResultIcon = () => {
    const hasSuccessfulUploads = uploadFilesResult.some((item) => item.success);
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
    const hasSuccessfulUploads = uploadFilesResult.some((item) => item.success);

    if (variant === 'quiz') {
      const successfulUploads = uploadFilesResult.filter(
        (item) => item.success
      ).length;
      return (
        <span className="text-size-14px font-semibold">
          {`Out of a total of ${totalFiles} files, ${successfulUploads} files were successfully uploaded.`}
        </span>
      );
    }

    if (variant === 'activityId') {
      const failedUploads = uploadFilesResult.flatMap(
        (item) => item.result.failures
      );
      const successfulUploads = uploadFilesResult.flatMap(
        (item) => item.result.data
      );
      const totalUploads = failedUploads.length + successfulUploads.length;

      return (
        <span>
          {failedUploads.length === 0
            ? 'The file has been uploaded successfully.'
            : `Out of a total of ${totalUploads} data items, ${successfulUploads.length} data items were successfully uploaded.`}
        </span>
      );
    }

    return (
      <span className="text-size-14px font-semibold">
        {hasSuccessfulUploads
          ? 'The file has been uploaded successfully.'
          : 'The file upload has failed.'}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogTrigger>{trigger}</DialogTrigger> */}
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

        <div className="flex flex-col gap-5">
          <div className="flex gap-2 items-center">
            <CircleX strokeWidth={3} className="size-[0.813rem] font-bold" />
            {variant !== 'activityId' && (
              <span>
                {uploadFilesResult.filter((item) => !item.success).length} files
                failed to upload.
              </span>
            )}
            {variant === 'activityId' && (
              <span>
                {`${uploadFilesResult.flatMap((item) => item.result.failures).length} items failed to upload.`}
              </span>
            )}
          </div>

          <div className="overflow-y-scroll max-h-[373px] border border-zinc-200 rounded-md">
            {(variant === 'quiz' || variant === 'hq') && (
              <table className={cn('w-full')}>
                <thead>
                  <tr className="text-zinc-500">
                    <Td className="py-4 ">Order</Td>
                    <Td className="py-4 ">File Result</Td>
                  </tr>
                </thead>
                <tbody>
                  {uploadFilesResult.map((item, index) => {
                    return (
                      <tr key={index} className="border-t border-t-zinc-200">
                        <Td>{index + 1}</Td>
                        <Td>
                          {!item.success ? (
                            <span className="text-red-500">
                              {item.error.message}
                            </span>
                          ) : (
                            <span>{item.quizSetFile?.path}</span>
                          )}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {variant === 'non-s' && (
              // <FilesTableComponent>
              //   {uploadFilesResult.map((item, index) => {
              //     console.log('🥕 non-s', item);
              //     return (
              //       <tr key={index} className="border-t border-t-zinc-200">
              //         <Td>{index + 1}</Td>
              //         <Td>{item.result.uploadedFile.path.split('/').pop()}</Td>
              //         <Td>
              //           <div className="flex items-center gap-2.5 text-red-600 font-medium">
              //             <CircleAlert className="size-4 shrink-0" />
              //             <span>{item.result.failures[0]}</span>
              //           </div>
              //         </Td>
              //       </tr>
              //     );
              //   })}
              // </FilesTableComponent>
              <></>
            )}
            {variant === 'activityId' && (
              <table className="w-full">
                <thead>
                  <tr>
                    <Td>Order</Td>
                    <Td>File Result</Td>
                  </tr>
                </thead>
                <tbody>
                  {uploadFilesResult.map((item, index) => {
                    if (!isEmpty(item.result.failures)) {
                      return item.result.failures.map(
                        (failure: any, failureIndex: number) => {
                          return (
                            <tr
                              key={failureIndex}
                              className="border-t border-t-zinc-200"
                            >
                              <Td>{failureIndex + 1}</Td>
                              <Td className="text-red-500">
                                {failure.message}
                              </Td>
                            </tr>
                          );
                        }
                      );
                    }
                    return <>11</>;
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <DialogFooter className="!justify-center">
          <DialogClose asChild>
            <Button
              className="shadow-none"
              variant={'action'}
              onClick={onOpenChange}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Confirm'}
            </Button>
          </DialogClose>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
