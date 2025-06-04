'use client';
import { useStateVariables } from '@/components/provider/state-provider';
import { swrFetcher } from '@/lib/fetch';
import { format } from 'date-fns';
import useSWR from 'swr';

const UploadedActivityInfo = () => {
  const { campaign } = useStateVariables();
  const { data } = useSWR(
    `/api/cms/activity/fileinfo?campaignId=${campaign?.id}`,
    swrFetcher
  );

  if (!data?.success) return <></>;
  return (
    <>
      <div className="w-[1px] h-3 bg-zinc-200" />
      <div className=" text-sm text-zinc-950">
        Uploaded Activity Info :
        <strong className="font-medium">
          {data.result.updatedBy ? (
            <span>{` ${data.result.updatedBy} / `}</span>
          ) : (
            <span className="text-zinc-300">{` Unknown User / `}</span>
          )}
          {format(data.result.updatedAt, 'yyyy.MM.dd HH:mm:ss')}
        </strong>
      </div>
    </>
  );
};

export default UploadedActivityInfo;
