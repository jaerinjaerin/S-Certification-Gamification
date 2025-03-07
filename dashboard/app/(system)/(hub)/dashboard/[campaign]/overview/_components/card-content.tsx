import { LoaderWithBackground } from '@/components/loader';

type Props = { info: string | number | null; caption: string; unit?: '%' | '' };

const InfoCardStyleContent = ({ info, caption, unit = '' }: Props) => {
  return (
    <>
      {info === undefined && <LoaderWithBackground />}
      <div className="text-zinc-950 font-bold text-size-24px my-1">
        {`${info?.toLocaleString() ?? 0}${unit}`}
      </div>
      <div className="text-zinc-500 text-size-12px">{caption}</div>
    </>
  );
};

export default InfoCardStyleContent;
