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
