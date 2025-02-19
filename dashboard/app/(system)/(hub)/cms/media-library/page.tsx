import {
  MediaAssetListContainer,
  MediaAssetItem,
} from './_components/media-asset-list';

export default function MediaLibraryPage() {
  // TODO: 미디어라이브러리 이미지 가져오기

  return (
    <div>
      <div className="text-zinc-950 font-semibold text-size-17px mb-4">
        Media Asset List
      </div>
      <div className="flex flex-col space-y-8">
        <MediaAssetListContainer title="Badge">
          {Array.from({ length: 4 }).map((_, index) => (
            <MediaAssetItem
              key={index}
              imageUrl={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg`}
              fileName={`image-${index + 1}`}
              updatedAt={`${new Date().toLocaleDateString()}`}
            />
          ))}
        </MediaAssetListContainer>
        <MediaAssetListContainer title="Character">
          {Array.from({ length: 4 }).map((_, index) => (
            <MediaAssetItem
              key={index}
              imageUrl={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg`}
              fileName={`image-${index + 1}`}
              updatedAt={`${new Date().toLocaleDateString()}`}
            />
          ))}
        </MediaAssetListContainer>
        <MediaAssetListContainer title="Background">
          {Array.from({ length: 4 }).map((_, index) => (
            <MediaAssetItem
              key={index}
              imageUrl={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/main_bg2.jpg`}
              fileName={`image-${index + 1}`}
              updatedAt={`${new Date().toLocaleDateString()}`}
            />
          ))}
        </MediaAssetListContainer>
      </div>
    </div>
  );
}
