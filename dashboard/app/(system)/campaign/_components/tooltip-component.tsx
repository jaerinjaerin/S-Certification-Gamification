import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function TooltipComponent({
  trigger,
  description,
  onOpenChange,
  open,
  side = 'top',
}: {
  trigger?: React.ReactNode;
  description: string | undefined;
  onOpenChange?: () => void;
  open?: boolean;
  side?: 'top' | 'left' | 'right' | 'bottom';
}) {
  return (
    <TooltipProvider>
      <Tooltip onOpenChange={onOpenChange} open={open}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent side={side} className="bg-zinc-100 rounded-lg p-3">
          <p className="text-[12px] text-zinc-500">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
