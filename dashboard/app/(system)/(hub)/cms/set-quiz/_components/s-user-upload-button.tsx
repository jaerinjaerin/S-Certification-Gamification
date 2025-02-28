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

export function HQUploadButton() {
  return (
    <div>
      <UploadExcelFileModal variant="hq" title="Upload HQ Quiz Set">
        <Button>HQ 업로드</Button>
      </UploadExcelFileModal>
    </div>
  );
}
