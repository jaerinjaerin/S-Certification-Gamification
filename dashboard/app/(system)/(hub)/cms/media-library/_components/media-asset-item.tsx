'use client';
import { Download, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleDownload } from '../../_utils/utils';
import { UploadImageFileModal } from './upload-image-file-modal';
import { useState } from 'react';

export function MediaAssetItem({
  id,
  group,
  imageUrl,
  fileName,
  updatedAt,
}: {
  id: string;
  group: MediaGroupName;
  imageUrl: string;
  fileName: string;
  updatedAt: string;
}) {
  const preview = useState<string | null>(null);
  return (
    <div className="border border-zinc-200 rounded-md p-2 w-[9.375rem]">
      <div className="relative rounded-md overflow-hidden w-[8.25rem] max-h-[8.25rem]">
        <img src={imageUrl} className="object-contain h-full" alt={fileName} />
      </div>
      <div className="flex justify-between mt-4">
        <span className="inline-block font-medium text-size-14px truncate">
          {fileName}
        </span>
        <div className="space-x-0.5 flex">
          <UploadImageFileModal id={id} group={group} preview={preview}>
            <Button
              size="icon"
              className="size-6 bg-zinc-50 hover:bg-zinc-200 shadow-none"
              onClick={() => {
                preview[1](imageUrl);
              }}
            >
              <Pen className="text-blue-500" />
            </Button>
          </UploadImageFileModal>
          <Button
            size="icon"
            className="size-6 bg-zinc-50 hover:bg-zinc-200 shadow-none"
            onClick={() => handleDownload(fileName, imageUrl)}
          >
            <Download className="text-zinc-950" />
          </Button>
        </div>
      </div>
      <span className="text-size-11px text-zinc-500">
        Last Updated: {updatedAt}
      </span>
    </div>
  );
}
