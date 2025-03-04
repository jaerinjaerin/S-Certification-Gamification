import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { DownloadFileListPopoverButton } from '../../_components/custom-popover';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import UploadExcelFileModal from './upload-excel-file-modal';
import { ChevronDown } from 'lucide-react';

export function SPlusUserUploadButton() {
  return (
    <div className="flex gap-3">
      <DownloadFileListPopoverButton type="data" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="action">
            <span>Upload</span>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <UploadExcelFileModal title="Upload Quiz Set" variant="quiz">
              <Button className="w-full justify-start" variant="ghost">
                Quiz Set
              </Button>
            </UploadExcelFileModal>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <UploadExcelFileModal
              variant="activityId"
              title="Upload Activity ID"
            >
              <Button className="w-full justify-start" variant="ghost">
                Activity ID
              </Button>
            </UploadExcelFileModal>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function NonSPlusUserUploadButton() {
  return (
    <div className="flex gap-3">
      <Button variant="secondary">Download Data</Button>
      <UploadExcelFileModal variant="non-s" title="Upload Non S+ User">
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
