import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import UploadExcelFileModal from './upload-excel-file-modal';
import { ChevronDown, DownloadIcon } from 'lucide-react';
import { PopoverWithButton } from '../../_components/custom-popover';
import { useState } from 'react';

export function SPlusUserUploadButton({
  handleDownloadQuizSet,
  handleDownloadActivityId,
}: {
  handleDownloadQuizSet: () => void;
  handleDownloadActivityId: () => void;
}) {
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="flex gap-3">
      <PopoverWithButton
        options={{
          children: <Button variant={'secondary'}>Download Data</Button>,
          content: (
            <div className="grid gap-6">
              <div className="space-y-2">
                <h3 className="text-base font-medium">Download Data</h3>
                <span className="text-[14px] text-sidebar-icon">
                  You can download data from the desired category all at once.
                </span>
              </div>
              <div className="flex flex-col gap-2 pl-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Quiz Set</span>
                  <Button
                    className="size-[32px] shadow-none"
                    size="icon"
                    variant="download"
                    onClick={handleDownloadQuizSet}
                  >
                    <DownloadIcon className="!w-3 !h-3" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Activity ID / Badge</span>
                  <Button
                    className="size-[32px] shadow-none"
                    size="icon"
                    variant="download"
                    onClick={handleDownloadActivityId}
                  >
                    <DownloadIcon className="!w-3 !h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ),
        }}
      />

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="action">
            <span>Upload</span>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <UploadExcelFileModal
              title="Upload Quiz Set"
              variant="quiz"
              onDropdownClose={onClose}
            >
              <Button className="w-full justify-start" variant="ghost">
                Quiz Set
              </Button>
            </UploadExcelFileModal>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <UploadExcelFileModal
              variant="activityId"
              title="Upload Activity ID"
              onDropdownClose={onClose}
              description="ActivityID allows only one file to be uploaded at a time."
            >
              <Button className="w-full justify-start" variant="ghost">
                Activity ID / Badge
              </Button>
            </UploadExcelFileModal>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function NonSPlusUserUploadButton({
  handleDownloadNonS,
}: {
  handleDownloadNonS: () => void;
}) {
  return (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={handleDownloadNonS}>
        Download Data
      </Button>
      <UploadExcelFileModal
        variant="non-s"
        title="Upload Non S+ User"
        description="Non S+ User allows only one file to be uploaded at a time."
      >
        <Button className="w-full justify-start" variant="action">
          <span>Upload</span>
        </Button>
      </UploadExcelFileModal>
    </div>
  );
}

export function HQUploadComponent() {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl">
      <UploadExcelFileModal variant="hq" title="Upload HQ Quiz Set">
        <div className="flex flex-col gap-6 justify-center items-center py-10">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Upload HQ Quiz Set first</h1>
            <span className="text-sm text-zinc-500">
              You must upload the HQ quiz set before configuring the quiz.
            </span>
          </div>

          <Button className="w-[16rem]">Upload</Button>
        </div>
      </UploadExcelFileModal>
    </div>
  );
}
