'use client';
import { Button } from '@/components/ui/button';
import { UploadImageFileModal } from './upload-image-file-modal';
import ChartContainer from '@/components/system/chart-container';

function MediaAssetListContainer({
  group,
  children,
}: {
  group: MediaGroupName;
  children: React.ReactNode;
}) {
  return (
    <ChartContainer>
      <div className="flex justify-between mb-[1.063rem]">
        <div className="mb-4 font-bold text-size-14px text-zinc-950 capitalize">
          {group}
        </div>
        <UploadImageFileModal group={group}>
          <Button className="bg-blue-600 hover:bg-blue-800 capitalize shadow-none">{`Add ${group}`}</Button>
        </UploadImageFileModal>
      </div>
      <div className="flex gap-x-3 gap-y-[1.063rem] flex-wrap">{children}</div>
    </ChartContainer>
  );
}

export default MediaAssetListContainer;
