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
  description: string | React.ReactNode | undefined;
  onOpenChange?: () => void;
  open?: boolean;
  side?: 'top' | 'left' | 'right' | 'bottom';
}) {
  return (
    <TooltipProvider>
      <Tooltip onOpenChange={onOpenChange} open={open}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          side={side}
          className="bg-zinc-100 rounded-lg p-3 text-[12px] text-zinc-500 whitespace-pre-line"
        >
          {typeof description === 'string' ? <p>{description}</p> : description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
