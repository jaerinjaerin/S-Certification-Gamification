'use client';
import { useEffect, useState } from 'react';
import { MediaAssetItem } from './media-asset-item';
import MediaAssetListContainer from './media-asset-list-container';
import { format } from 'date-fns';
import { useMediaData } from '../_provider/media-data-provider';
import { LoaderWithBackground } from '@/components/loader';

type Props = { group: MediaGroupName; data: MediaPros[] };

const MediaAssetGroup = ({ group, data }: Props) => {
  const { state, dispatch } = useMediaData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (data) {
      //
      switch (group) {
        case 'badge':
          dispatch({ type: 'SET_BADGE', payload: data });
          break;
        case 'character':
          dispatch({ type: 'SET_CHARACTER', payload: data });
          break;
        case 'background':
          dispatch({ type: 'SET_BACKGROUND', payload: data });
          break;
      }
      setLoading(false);
    }
  }, []);

  return (
    <MediaAssetListContainer group={group}>
      {loading && <LoaderWithBackground />}
      {(state[group] || data).map((image) => {
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
