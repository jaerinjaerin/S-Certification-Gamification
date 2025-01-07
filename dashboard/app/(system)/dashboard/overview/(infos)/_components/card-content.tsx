type Props = { info: string; caption: string };

const InfoCardStyleContent = ({ info, caption }: Props) => {
  return (
    <>
      <div className="text-zinc-950 font-bold text-size-24px">{info}</div>
      <div className="text-zinc-500 text-size-12px">{caption}</div>
    </>
  );
};

export default InfoCardStyleContent;
