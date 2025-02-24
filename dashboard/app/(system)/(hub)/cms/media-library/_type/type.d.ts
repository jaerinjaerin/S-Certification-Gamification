type MediaDataProps = {
  badge: MediaProps[] | null;
  character: MediaProps[] | null;
  background: MediaProps[] | null;
};

type MediaProps = {
  index: number;
  id: string;
  name: string;
  url: string;
  date: Date;
};

type MediaPreviewProps = {
  imageUrl: string;
  fileName: string;
  updatedAt: Date;
};

type MediaGroupName = 'badge' | 'character' | 'background';
