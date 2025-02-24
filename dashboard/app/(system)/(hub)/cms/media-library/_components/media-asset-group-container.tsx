'use client';
import { useEffect } from 'react';
import { useMediaData } from '../_provider/media-data-provider';
import { useAbortController } from '@/components/hook/use-abort-controller';
import { fetchData } from '@/lib/fetch';
import MediaAssetGroup from './media-asset-group';
import { useStateVariables } from '@/components/provider/state-provider';

const MediaAssetGroupContainer = () => {
  const { campaign } = useStateVariables();
  const { dispatch } = useMediaData();
  const { abort, createController } = useAbortController();

  useEffect(() => {
    if (campaign) {
      fetchData(
        { campaignId: campaign.id },
        'cms/media',
        (data) => {
          console.log('🚀 ~ useEffect ~ data:', data);
          const { badge, character, background } =
            data.result as MediaDataProps;
          dispatch({ type: 'SET_BADGE', payload: badge || [] });
          dispatch({ type: 'SET_CHARACTER', payload: character || [] });
          dispatch({ type: 'SET_BACKGROUND', payload: background || [] });
        },
        createController()
      );
    }

    return () => {
      abort();
    };
  }, [campaign]);

  return (
    <div className="flex flex-col space-y-8">
      <MediaAssetGroup group="badge" />
      <MediaAssetGroup group="character" />
      <MediaAssetGroup group="background" />
    </div>
  );
};

export default MediaAssetGroupContainer;
