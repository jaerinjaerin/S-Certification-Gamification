'use client';
import { LoaderWithBackground } from '@/components/loader';
import { useMediaData } from '../_provider/media-data-provider';
import { MediaAssetItem } from './media-asset-item';
import MediaAssetListContainer from './media-asset-list-container';

type Props = { group: MediaGroupName };

const MediaAssetGroup = ({ group }: Props) => {
  const { state } = useMediaData();
  const data = state[group];
  console.log('data', data);

  return (
    <MediaAssetListContainer group={group}>
      {!data && <LoaderWithBackground />}
      {data?.map((image) => {
        const fileName = (image.index + 1).toString();
        const key = `${image.id}_${image.date}`;
        return (
          <MediaAssetItem
            key={key}
            id={image.id}
            group={group}
            imageUrl={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${image.url}`}
            fileName={fileName}
            updatedAt={image.date}
          />
        );
      })}
    </MediaAssetListContainer>
  );
};

export default MediaAssetGroup;
