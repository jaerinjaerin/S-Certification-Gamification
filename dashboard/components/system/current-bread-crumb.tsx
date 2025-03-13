'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { usePathname, useRouter } from 'next/navigation';
import { MoveLeft, Slash } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useStateVariables } from '../provider/state-provider';
import { Fragment } from 'react';
import { Button } from '../ui/button';

const CurrentBreadCrumb = () => {
  const router = useRouter();
  const { campaigns, campaign, setCampaign } = useStateVariables();
  const pathname = usePathname();
  const paths = pathname
    .split('/')
    .filter(Boolean)
    .map((name) => name.replaceAll('-', ' '));

  const handleChangeCampaign = async (value: string) => {
    if (!campaigns) return;
    if (value === '/campaign') router.push(value);
    //
    await setCampaign(value);
  };

  const UppercaseFormat = (text: string) => {
    const words = text.split(' ');

    return words[0].toUpperCase() + ' ' + words[1];
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {pathname.includes('/quiz-set-details') ? (
            <Button variant="secondary" onClick={() => router.back()}>
              <MoveLeft /> Back
            </Button>
          ) : (
            <Select
              value={campaign?.id || ''}
              onValueChange={handleChangeCampaign}
            >
              <SelectTrigger className="w-full focus:ring-0">
                <SelectValue placeholder={campaign?.name || ''} />
              </SelectTrigger>
              <SelectContent>
                {pathname.includes('/quiz-set-details') ? (
                  <>back</>
                ) : (
                  <>
                    <SelectItem
                      value="/campaign"
                      className="font-bold border-b text-base"
                    >
                      Certification List
                    </SelectItem>
                    {campaigns?.map((c: { id: string; name: string }) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        {paths.map((item, index) => {
          return (
            <Fragment key={index}>
              <BreadcrumbItem
                className={cn([
                  index !== paths.length - 1
                    ? 'text-zinc-500'
                    : 'text-zinc-950',
                  item.toLowerCase() === 'cms' ? 'uppercase' : 'capitalize',
                ])}
              >
                {item.toLocaleLowerCase() === 'ui language'
                  ? UppercaseFormat(item)
                  : item}
              </BreadcrumbItem>
              {index < paths.length - 1 && ( // 마지막 아이템에는 Separator를 추가하지 않음
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CurrentBreadCrumb;
