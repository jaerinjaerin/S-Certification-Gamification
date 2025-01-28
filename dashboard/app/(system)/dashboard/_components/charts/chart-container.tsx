type Props = {
  children: React.ReactNode;
};

const ChartContainer = ({ children }: Props) => {
  return <div className="relative p-6 border rounded-xl">{children}</div>;
};

export default ChartContainer;
