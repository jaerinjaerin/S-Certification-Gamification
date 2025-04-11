'use client';

import { Button } from '@/components/ui/button';

import { DownloadIcon, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ButtonVariant } from '../_types/type';
import { handleDownload } from '../_utils/utils';
import { useState } from 'react';

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
      <PopoverContent align="end" className="w-fit p-6">
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

const downloadConfig: Record<'template', PopoverConfig> = {
  template: {
    items: [
      { label: 'QuizSet', name: 'QuizSet' },
      { label: 'ActivityID_Badge', name: 'Activity ID / Badge' },
      { label: 'NonSUser', name: 'Non S+ Users' },
      { label: 'UILanguage', name: 'UI Language' },
      { label: 'Target', name: 'Target' },
    ],
    title: 'Download Templates',
    description: 'You can download the templates for the quiz.',
  },
};

export function DownloadFileListPopoverButton({
  type,
  buttonVariant = 'secondary',
}: {
  type: 'template';
  buttonVariant?: ButtonVariant;
}) {
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  const handleDownloadFile = async (label: string) => {
    setLoadingItem(label);
    const FILE_NAME = `${label}_template.xlsx`;
    const DOWNLOAD_URL = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/common/templates/${FILE_NAME}`;
    await handleDownload(FILE_NAME, DOWNLOAD_URL);
    setLoadingItem(null);
  };

  return (
    <PopoverWithButton
      options={{
        children: (
          <Button variant={buttonVariant}>{downloadConfig[type].title}</Button>
        ),
        content: (
          <div className="grid gap-6">
            <div className="space-y-2">
              <h3 className="text-base font-medium">
                {downloadConfig[type].title}
              </h3>
              <span className="text-[14px] text-sidebar-icon">
                {downloadConfig[type].description}
              </span>
            </div>
            <div className="flex flex-col gap-2 pl-2">
              {downloadConfig[type].items.map((item) => (
                <div
                  className="flex justify-between items-center"
                  key={item.label}
                >
                  <span className="font-medium">{item.name}</span>
                  <Button
                    className="size-[32px] shadow-none"
                    size="icon"
                    variant="download"
                    onClick={() => handleDownloadFile(item.label)}
                    disabled={loadingItem === item.label}
                  >
                    {loadingItem === item.label ? (
                      <Loader2 className="animate-spin !w-3 !h-3" />
                    ) : (
                      <DownloadIcon className="!w-3 !h-3" />
                    )}
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
