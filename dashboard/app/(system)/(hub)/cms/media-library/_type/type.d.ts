type MediaDataProps = {
  badge: MediaProps[] | null;
  character: MediaProps[] | null;
  background: MediaProps[] | null;
};

type MediaGroupName = 'badge' | 'character' | 'background';

type MediaProps = {
  index: number;
  id: string;
  name: string;
  type: MediaGroupName;
  url: string;
  date: Date;
};

type MediaPreviewProps = {
  imageUrl: string;
  fileName: string;
  updatedAt: Date;
};
