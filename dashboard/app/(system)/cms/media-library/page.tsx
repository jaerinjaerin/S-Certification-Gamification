'use client';
import { Button } from '@/components/ui/button';

import {
  MediaAssetListContainer,
  MediaAssetItem,
} from './_components/media-asset-list';
import { UploadImageFileModal } from './_components/upload-image-file-modal';

export default function MediaLibraryPage() {
  // TODO: 미디어라이브러리 이미지 가져오기

  return (
    <div className="flex flex-col">
      <span>Media Asset List</span>
      <div>Badge</div>
      <MediaAssetListContainer>
        <h4>Badge</h4>
        <div className="flex">
          {Array.from({ length: 4 }).map((_, index) => (
            <MediaAssetItem
              key={index}
              imageUrl={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg`}
              fileName={`image-${index + 1}`}
              updatedAt={`${new Date().toLocaleDateString()}`}
            />
          ))}
        </div>
        <div>Character</div>
        <UploadImageFileModal type="add">
          <Button variant="action" className="absolute top-0 right-0">
            Add Badge
          </Button>
        </UploadImageFileModal>
      </MediaAssetListContainer>
      <div>Character</div>
      <MediaAssetListContainer>
        <h4>Character</h4>
        <div className="flex">
          {Array.from({ length: 4 }).map((_, index) => (
            <MediaAssetItem
              key={index}
              imageUrl={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg`}
              fileName={`image-${index + 1}`}
              updatedAt={`${new Date().toLocaleDateString()}`}
            />
          ))}
        </div>
        <UploadImageFileModal type="add">
          <Button variant="action" className="absolute top-0 right-0">
            Add Character
          </Button>
        </UploadImageFileModal>
      </MediaAssetListContainer>
      <div>Background</div>
      <MediaAssetListContainer>
        <h4>Background</h4>
        <div className="flex">
          {Array.from({ length: 4 }).map((_, index) => (
            <MediaAssetItem
              key={index}
              imageUrl={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg`}
              fileName={`image-${index + 1}`}
              updatedAt={`${new Date().toLocaleDateString()}`}
            />
          ))}
        </div>
        <UploadImageFileModal type="add">
          <Button variant="action" className="absolute top-0 right-0">
            Add Background
          </Button>
        </UploadImageFileModal>
      </MediaAssetListContainer>
    </div>
  );
}
