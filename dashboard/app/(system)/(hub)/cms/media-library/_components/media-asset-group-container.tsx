'use client';
import { useEffect } from 'react';
import { useMediaData } from '../_provider/media-data-provider';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import MediaAssetGroup from './media-asset-group';
import { useStateVariables } from '@/components/provider/state-provider';
import useSWR from 'swr';

const MediaAssetGroupContainer = () => {
  const { campaign } = useStateVariables();
  const { dispatch } = useMediaData();
  const { data } = useSWR(
    `/api/cms/media?${searchParamsToQuery({ campaignId: campaign?.id })}`,
    swrFetcher
  );
  const {
    result: { badge, character, background },
  }: { result: MediaDataProps } = data || {
    result: { badge: [], character: [], background: [] },
  };

  useEffect(() => {
    if (data) {
      dispatch({ type: 'SET_BADGE', payload: badge! });
      dispatch({ type: 'SET_CHARACTER', payload: character! });
      dispatch({ type: 'SET_BACKGROUND', payload: background! });
    }
  }, [data]);

  return (
    <div className="flex flex-col space-y-8">
      <MediaAssetGroup group="badge" />
      <MediaAssetGroup group="character" />
      <MediaAssetGroup group="background" />
    </div>
  );
};

export default MediaAssetGroupContainer;
