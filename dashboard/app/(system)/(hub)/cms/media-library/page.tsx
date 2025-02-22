import { MediaDataProvider } from './_provider/media-data-provider';
import SectionTitle from '../_components/section-title-container';
import MediaAssetGroupContainer from './_components/media-asset-group-container';

export default async function MediaLibraryPage() {
  return (
    <MediaDataProvider>
      <div>
        <SectionTitle>Media Asset List</SectionTitle>
        <MediaAssetGroupContainer />
      </div>
    </MediaDataProvider>
  );
}
