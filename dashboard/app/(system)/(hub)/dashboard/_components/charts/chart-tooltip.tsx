/* eslint-disable @typescript-eslint/no-explicit-any */
import { TooltipProps } from 'recharts';

interface ProgressTooltipProps extends TooltipProps<number, string> {
  goal?: number;
}

export const ProgressTooltip = ({
  active,
  payload,
  label,
  goal,
}: ProgressTooltipProps) => {
  if (active && payload && payload.length) {
    const total =
      (payload[0]?.value ?? 0) +
      (payload[1]?.value ?? 0) +
      (payload[2]?.value ?? 0) +
      (payload[3]?.value ?? 0);
    const rate = ((total / (goal ?? 1)) * 100).toFixed(2);

    return (
      <div className="border rounded-md bg-white p-5 shadow-sm space-y-2">
        <p className="text-zinc-500">
          {label} ({payload[4]?.value ?? 0}%)
        </p>
        <p className="font-bold text-size-16px">{`Achievement: ${rate}%`}</p>
        <p key={1} className="text-size-16px">{`${
          payload[1]?.name ?? 'N/A'
        }: ${(payload[1]?.value ?? 0).toLocaleString()}`}</p>
        <p key={0} className="text-size-16px">{`${
          payload[0]?.name ?? 'N/A'
        }: ${(payload[0]?.value ?? 0).toLocaleString()}`}</p>
        <p key={3} className="text-size-16px">{`${
          payload[3]?.name ?? 'N/A'
        }: ${(payload[3]?.value ?? 0).toLocaleString()}`}</p>
        <p key={2} className="text-size-16px">{`${
          payload[2]?.name ?? 'N/A'
        }: ${(payload[2]?.value ?? 0).toLocaleString()}`}</p>
        <p
          key={5}
          className="text-size-16px"
        >{`Total : ${total.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export const ExpertsTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const total = (payload[0]?.value ?? 0) + (payload[1]?.value ?? 0);
    return (
      <div className="border rounded-md bg-white p-5 shadow-sm space-y-2">
        <p className="text-zinc-500">{label}</p>
        <p className="font-bold text-size-16px">{`Total: ${total.toLocaleString()}`}</p>
        {payload.map((data: any, index: number) => (
          <p key={index} className="text-size-16px">{`${
            data.name
          }: ${data.value.toLocaleString()}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="border rounded-md bg-white p-5 shadow-sm space-y-2">
        <p className="text-zinc-500">{label}</p>
        {payload.map((data: any, index: number) => (
          <p key={index} className="font-bold text-size-16px">{`${
            data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()
          }: ${data.value.toLocaleString()}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;

export const CustomTimeTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    // 중복 제거 (dataKey 기준으로 고유한 값만 표시)
    const uniqueData = payload.reduce((acc: any, item) => {
      if (!acc.some((data: any) => data.dataKey === item.dataKey)) {
        acc.push(item);
      }
      return acc;
    }, []);

    return (
      <div className="border rounded-md bg-white p-5 shadow-sm space-y-2">
        <p className="text-zinc-500">{label}</p>
        {uniqueData.map((data: any, index: number) => (
          <p key={index} className="font-bold text-size-16px">{`${
            data.name
          }: ${data.value.toLocaleString()}min`}</p>
        ))}
      </div>
    );
  }
  return null;
};
