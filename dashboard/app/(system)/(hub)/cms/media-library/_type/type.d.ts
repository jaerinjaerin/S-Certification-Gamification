type MediaDataProps = {
  badge: MediaPros[];
  character: MediaPros[];
  background: MediaPros[];
};

type MediaPros = {
  index: number;
  id: string;
  name: string;
  url: string;
  date: Date;
};

type MediaGroupName = 'badge' | 'character' | 'background';
