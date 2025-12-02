import { cn } from '@/utils/utils';

export function FilesTableComponent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <table className={cn('w-full', className)}>
      <thead>
        <tr className="text-zinc-500">
          <Td className="py-4 w-[9.5rem]">Order</Td>
          <Td className="py-4 w-[18.25rem]">File Name</Td>
          <Td className="py-4 w-[18.25rem]">Details</Td>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export const Td = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <td className={cn('py-6 px-4', className)}>{children}</td>;
};
