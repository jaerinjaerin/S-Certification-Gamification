import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PenIcon } from 'lucide-react';
import { handleDownload } from '../../_utils/utils';
import { UploadImageFileModal } from './upload-image-file-modal';

export function MediaAssetListContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border border-zinc-200 rounded-lg flex-col relative">
      {children}
    </div>
  );
}

// TODO: 데이터에서 받아와야할 것: 이미지주소, 업데이트된 날짜,
export function MediaAssetItem({
  imageUrl,
  fileName,
  updatedAt,
}: {
  imageUrl: string;
  fileName: string;
  updatedAt: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="border border-zinc-200 rounded-md size-[150px]">
        <img src={imageUrl} className="object-cover w-full h-full" />
      </div>
      <div className="flex">
        <span className="inline-block">{fileName}</span>
        <UploadImageFileModal type="edit">
          <Button variant="download" size="icon" className="ml-auto size-6">
            <PenIcon color="#2563EB" />
          </Button>
        </UploadImageFileModal>
        <Button
          variant="download"
          size="icon"
          className="size-6"
          onClick={() => handleDownload(fileName, imageUrl)}
        >
          <Download />
        </Button>
      </div>
      <span>Last Updated: {updatedAt} </span>
    </div>
  );
}
