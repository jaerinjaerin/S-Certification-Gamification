import { serializeJsonToQuery } from '@/lib/search-params';
import axios from 'axios';
import MediaAssetGroup from './_components/media-asset-group';
import { MediaDataProvider } from './_provider/media-data-provider';

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: JsonObject;
}) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cms/media?${serializeJsonToQuery(searchParams)}`
  );
  const { badge, character, background } = response.data
    .result as MediaDataProps;

  return (
    <MediaDataProvider>
      <div>
        <div className="text-zinc-950 font-semibold text-size-17px mb-4">
          Media Asset List
        </div>
        <div className="flex flex-col space-y-8">
          <MediaAssetGroup group="badge" data={badge} />
          <MediaAssetGroup group="character" data={character} />
          <MediaAssetGroup group="background" data={background} />
        </div>
      </div>
    </MediaDataProvider>
  );
}
