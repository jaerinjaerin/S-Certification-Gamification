import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { title: string; numbers: string; description: string };

const CardCustomHeader = ({ title, numbers, description }: Props) => {
  return (
    <CardHeader>
      <CardTitle className="font-bold text-size-18px text-zinc-950">
        {title}
      </CardTitle>
      <div className="flex items-center space-x-3">
        <div className="font-bold text-size-24px text-zinc-950">{numbers}</div>
        <CardDescription>{description}</CardDescription>
      </div>
    </CardHeader>
  );
};

export default CardCustomHeader;
