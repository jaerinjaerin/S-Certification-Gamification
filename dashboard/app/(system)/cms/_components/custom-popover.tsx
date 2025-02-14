'use client';

import { Button } from '@/components/ui/button';

import { DownloadIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ButtonVariant } from '../_types/type';

// popover가 나타나는 버튼컴포넌트
type PopoverWithButtonProps = {
  options: {
    children: React.ReactNode;
    content?: React.ReactNode;
  };
};

export function PopoverWithButton(props: PopoverWithButtonProps) {
  // chilren은 popover 트리거하는 버튼
  // content는 title, description, download items(item.name, download button)
  const { children, content } = props.options;
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="end" className="w-fit">
        {content}
      </PopoverContent>
    </Popover>
  );
}

type DownloadItem = {
  label: string;
  name: string;
};

type PopoverConfig = {
  items: DownloadItem[];
  title: string;
  description: string;
};

const downloadConfig: Record<'template' | 'data', PopoverConfig> = {
  template: {
    items: [
      { label: 'quizset', name: 'QuizSet' },
      { label: 'activity-id', name: 'Activity ID' },
      { label: 'pp', name: 'PP' },
      { label: 'term', name: 'Term' },
      { label: 'non-user', name: 'Non S+ Users' },
      { label: 'target', name: 'Target' },
    ],
    title: 'Download Templates',
    description: 'You can download the templates for the quiz.',
  },
  data: {
    items: [
      { label: 'quizset', name: 'QuizSet' },
      { label: 'activity-id', name: 'Activity ID' },
      { label: 'pp', name: 'PP' },
      { label: 'term', name: 'Term' },
    ],
    title: 'Download Data',
    description: 'You can download data from the desired category all at once.',
  },
};

export function DownloadFileListPopoverButton({
  type,
  buttonVariant = 'secondary',
}: {
  type: 'template' | 'data';
  buttonVariant?: ButtonVariant;
}) {
  const handleDownloadeFile = () => {
    console.log('🥕 label에 맞는 파일 다운로드 필요');
  };
  return (
    <PopoverWithButton
      options={{
        children: (
          <Button variant={buttonVariant}>{downloadConfig[type].title}</Button>
        ),
        content: (
          <div className="grid gap-4">
            <div className="space-y-2">
              <h3>{downloadConfig[type].title}</h3>
              <span>{downloadConfig[type].description}</span>
            </div>
            <div>
              {downloadConfig[type].items.map((item) => (
                <div key={item.label}>
                  <span>{item.name}</span>
                  <Button
                    size="icon"
                    variant="download"
                    onClick={handleDownloadeFile}
                  >
                    <DownloadIcon />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ),
      }}
    />
  );
}
