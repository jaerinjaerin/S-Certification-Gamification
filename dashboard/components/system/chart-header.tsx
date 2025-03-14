import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

type Props = { title: string; numbers?: string; description: string };

const CardCustomHeader = ({ title, numbers, description }: Props) => {
  return (
    <div className="mb-4">
      <div className="font-bold text-size-18px text-zinc-950">{title}</div>
      {numbers ? (
        <div className="flex items-center space-x-3">
          <div className="font-bold text-size-24px text-zinc-950">
            {numbers}
          </div>
          <div className="text-size-14px text-zinc-600">{description}</div>
        </div>
      ) : (
        <div className="text-size-14px text-zinc-600">{description}</div>
      )}
    </div>
  );
};

export default CardCustomHeader;

export const CardCustomHeaderWithoutDesc = ({ title }: { title: string }) => {
  return (
    <div className="mb-4 font-bold text-size-18px text-zinc-950">{title}</div>
  );
};

export const CardCustomHeaderWithDownload = ({
  title,
  onDownload,
}: {
  title: string;
  onDownload: () => void;
}) => {
  return (
    <div className="mb-4 font-bold text-size-18px text-zinc-950 flex items-center justify-between">
      <div>{title}</div>
      <Button variant="outline" type="button" onClick={onDownload}>
        <div className="flex items-center space-x-2 text-zinc-950">
          <Download />
          <span>Download Report</span>
        </div>
      </Button>
    </div>
  );
};
