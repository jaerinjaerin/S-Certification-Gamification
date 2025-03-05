'use client';
import { LoaderWithBackground } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import { Language, UploadedFile } from '@prisma/client';
import useSWR from 'swr';

export function DataTable() {
  const { campaign } = useStateVariables();
  const { data, isLoading: loading } = useSWR(
    `/api/cms/ui_language?${searchParamsToQuery({ campaignId: campaign?.id })}`,
    swrFetcher
  );

  if (loading) {
    return <LoaderWithBackground />;
  }

  if (!data.result.groupedLanguages) {
    return null;
  }

  return (
    <>
      {data.result.groupedLanguages.map(
        (groupedData: { file: UploadedFile; language: Language }) => (
          <>
            <div>
              {groupedData.language.name}
              {groupedData.language.code},
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${groupedData.file.path}`}
              download
              target="_self"
            >
              <button>파일 다운로드</button>
            </a>
          </>
        )
      )}
    </>
  );
}
