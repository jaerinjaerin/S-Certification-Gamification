'use client';
import { MediaAssetItem } from './media-asset-item';
import MediaAssetListContainer from './media-asset-list-container';
import { format } from 'date-fns';
import { useMediaData } from '../_provider/media-data-provider';
import { LoaderWithBackground } from '@/components/loader';

type Props = { group: MediaGroupName };

const MediaAssetGroup = ({ group }: Props) => {
  const { state } = useMediaData();
  const data = state[group];

  return (
    <MediaAssetListContainer group={group}>
      {data?.length === 0 && <LoaderWithBackground />}
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
            updatedAt={format(image.date, 'yy.MM.dd')}
          />
        );
      })}
    </MediaAssetListContainer>
  );
};

export default MediaAssetGroup;
