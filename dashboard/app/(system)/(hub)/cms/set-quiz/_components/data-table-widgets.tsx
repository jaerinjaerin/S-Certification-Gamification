import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/utils';
import { ExternalLink } from 'lucide-react';
import { useNavigation } from '../../_hooks/useNavigation';
import { GroupedQuizSet } from '../_type/type';

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

function StatusCircle({ label }: { label: 'Ready' | 'Not Ready' }) {
  return (
    <div
      className={cn(
        'size-4 rounded-full',
        label === 'Ready' ? 'bg-green-300' : 'bg-red-300'
      )}
    />
  );
}

// TODO: label props로 받아야 함
function StatusBadge({ label }: { label: 'Ready' | 'Not Ready' }) {
  return (
    <span
      className={cn(
        'w-fit text-size-14px font-medium px-2 py-[3.5px] rounded-full leading-tight flex items-center justify-center',
        label === 'Ready' ? 'bg-green-300' : 'bg-red-300'
      )}
    >
      Ready{label}
    </span>
  );
}

function QuizSetLink({ props }: { props: GroupedQuizSet['quizSet'] }) {
  const { routeToPage } = useNavigation();

  return (
    <Button
      variant={'secondary'}
      className="w-fit h-auto text-left rounded-lg px-[10px] py-1 gap-8 border-zinc-200 shadow-none"
      onClick={() =>
        routeToPage(`/cms/set-quiz/quiz-set-details?id=${props.id}`)
      }
    >
      <div className="text-size-12px leading-tight font-semibold">
        <p className="text-zinc-950">
          {props.domain.name}({props.language.name})
        </p>
        <p className="text-description">{props.jobCodes[0]}</p>
      </div>
      <div>
        <ExternalLink className="text-zinc-950" />
      </div>
    </Button>
  );
}

// TODO: id랑 stage props로 받아야 함
function ActivityIdBadge({
  id,
  stage,
}: {
  id: string | number;
  stage: number;
}) {
  return (
    <div className="border border-zinc-200 rounded-full px-[10px] flex items-center gap-1 w-fit font-semibold">
      <div className="rounded-full bg-zinc-200 size-[14px] flex items-center justify-center leading-none text-size-12px">
        3{id}
      </div>

      <span>102978{stage}</span>
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
