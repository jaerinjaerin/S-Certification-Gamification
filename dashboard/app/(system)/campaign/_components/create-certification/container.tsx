import { cn } from '@/utils/utils';

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-8 items-end min-[880px]:gap-0 min-[880px]:grid-cols-2',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
