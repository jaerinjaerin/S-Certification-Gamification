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

type MediaGroupName = 'badge' | 'character' | 'background';
