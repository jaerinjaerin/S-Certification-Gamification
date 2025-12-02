import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ReadyStatus } from '@/types';
import { QuizSetEx } from '@/types/apiTypes';
import { cn } from '@/utils/utils';
import { ChevronRight } from 'lucide-react';
import { useNavigation } from '../../_hooks/useNavigation';

function ActiveToggle({
  checked,
  onCheckedChange,
}: {
  checked?: boolean;
  onCheckedChange?: () => void;
}) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="data-[state=unchecked]:bg-zinc-200 data-[state=checked]:bg-zinc-950 shadow-none"
    />
  );
}

function StatusCircle({ isReady }: { isReady: boolean }) {
  return (
    <div
      className={cn(
        'size-4 rounded-full',
        isReady ? 'bg-green-300' : 'bg-red-300'
      )}
    />
  );
}

function StatusBadge({ status }: { status: ReadyStatus }) {
  const { bgColor, label } = (() => {
    switch (status) {
      case ReadyStatus.READY:
        return { bgColor: 'bg-green-400', label: 'Ready' };
      case ReadyStatus.PARTIALLY_READY:
        return { bgColor: 'bg-yellow-300', label: 'Partially Ready' };
      case ReadyStatus.NOT_READY:
        return { bgColor: 'bg-red-300', label: 'Not Ready' };
      default:
        return { bgColor: 'bg-gray-300', label: 'Unknown' }; // ✅ fallback
    }
  })();

  return (
    <span
      className={cn(
        'w-fit text-size-14px font-medium px-2 py-[3.5px] text-nowrap rounded-full leading-tight flex items-center justify-center',
        bgColor
      )}
    >
      {label}
    </span>
  );
}

function QuizSetLink({ props }: { props: QuizSetEx }) {
  const { routeToPage } = useNavigation();

  return (
    <Button
      variant={'secondary'}
      className="w-[12.5rem] justify-between h-auto text-left rounded-lg px-[10px] py-1 gap-8 border-zinc-200 shadow-none"
      onClick={() =>
        routeToPage(`/cms/set-quiz/quiz-set-details?id=${props!.id}`)
      }
    >
      <div className="text-size-12px leading-tight font-semibold">
        <p className="text-zinc-950 w-[7.938rem] truncate">
          {props?.language?.name}
        </p>
        <p className="text-description">{props.jobCodes[0]}</p>
      </div>
      <div>
        <ChevronRight className="text-zinc-950" />
      </div>
    </Button>
  );
}

// TODO: id랑 stage props로 받아야 함
function ActivityIdBadge({
  id,
  src,
  stage,
}: {
  id?: string | number;
  src?: string;
  stage: number;
}) {
  return (
    <div className="border border-zinc-200 rounded-full px-[10px] py-2 flex items-center gap-1 w-max h-8 font-semibold">
      <div className="rounded-full shrink-0 bg-zinc-200 size-[14px] flex items-center justify-center leading-none text-size-12px">
        {stage}
      </div>
      {src ? (
        <img className="size-6" src={src} alt="badge" />
      ) : (
        <span>{id}</span>
      )}
    </div>
  );
}

export {
  ActiveToggle,
  ActivityIdBadge,
  QuizSetLink,
  StatusBadge,
  StatusCircle,
};
