'use client';
import { Download, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleDownload } from '../../_utils/utils';
import { UploadImageFileModal } from './upload-image-file-modal';
import ChartContainer from '@/components/system/chart-container';

export function MediaAssetListContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ChartContainer>
      <div className="flex justify-between mb-5">
        <div className="mb-4 font-bold text-size-14px text-zinc-950">
          {title}
        </div>
        <UploadImageFileModal type="add">
          <Button className="bg-blue-600 hover:bg-blue-800">{`Add ${title}`}</Button>
        </UploadImageFileModal>
      </div>
      <div className="flex gap-4 flex-wrap">{children}</div>
    </ChartContainer>
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
    <div className="">
      <div className="relative border border-zinc-200 rounded-md size-[9.375rem]">
        <img src={imageUrl} className="object-cover w-full h-full" />
      </div>
      <div className="flex justify-between mt-4">
        <span className="inline-block font-medium text-size-14px">
          {fileName}
        </span>
        <div className="space-x-0.5">
          <UploadImageFileModal type="edit">
            <Button
              size="icon"
              className="size-6 bg-zinc-50 hover:bg-zinc-200 shadow-none"
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
      <span className="text-size-12px text-zinc-500">
        Last Updated: {updatedAt}
      </span>
    </div>
  );
}
