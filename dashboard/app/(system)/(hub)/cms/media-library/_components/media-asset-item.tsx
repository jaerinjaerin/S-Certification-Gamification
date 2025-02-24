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
    <div className="w-[9.375rem]">
      <div className="relative aspect-square rounded-md overflow-hidden w-full max-h-[9.375rem] border border-zinc-200">
        <img src={imageUrl} className="object-cover size-full" alt={fileName} />
      </div>
      <div className="flex justify-between mt-3">
        <span className="inline-block font-medium text-size-14px truncate">
          {fileName}
        </span>
        <div className="flex space-x-[5px]">
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
      <span className="text-size-12px mt-1 text-zinc-500">
        Last Updated: {updatedAt}
      </span>
    </div>
  );
}
