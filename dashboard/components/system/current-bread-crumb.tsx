'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  // BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { usePathname, useRouter } from 'next/navigation';
import { Slash } from 'lucide-react';
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
import { Campaign } from '@prisma/client';

const CurrentBreadCrumb = () => {
  const router = useRouter();
  const { campaigns, campaign, setCampaign } = useStateVariables();
  const pathname = usePathname();
  const paths = pathname
    .split('/')
    .filter(Boolean)
    .map((name) => name.replaceAll('-', ' '));

  const handleChangeCampaign = (value: string) => {
    if (!campaigns) return;
    if (value === '/campaign') router.push(value);
    //
    const selectedCampaign = campaigns.find((c: Campaign) => c.id === value);
    if (selectedCampaign) setCampaign(selectedCampaign);
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Select
            value={campaign?.id || ''}
            onValueChange={handleChangeCampaign}
          >
            <SelectTrigger className="w-full focus:ring-0">
              <SelectValue placeholder={campaign?.name || ''} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/campaign" className="font-bold border-b">
                Certification List
              </SelectItem>
              {campaigns?.map((c: Campaign) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                {item}
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
