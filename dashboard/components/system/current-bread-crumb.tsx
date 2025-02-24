'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  // BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { usePathname } from 'next/navigation';
import { Slash } from 'lucide-react';
import { cn } from '@/lib/utils';
import useSWR from 'swr';
import { swrFetcher } from '@/lib/fetch';
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
  const { campaign, setCampaign } = useStateVariables();
  const { data } = useSWR('/api/cms/campaign', swrFetcher);
  const campaigns = data?.result.campaigns;
  const pathname = usePathname();
  const paths = pathname
    .split('/')
    .filter(Boolean)
    .map((name) => name.replaceAll('-', ' '));

  const handleChangeCampaign = (value: string) => {
    const selectedCampaign = campaigns.find((c: Campaign) => c.id === value);
    setCampaign(selectedCampaign);
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Select
            value={campaign?.id || ''}
            onValueChange={handleChangeCampaign}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={campaign?.name || ''} />
            </SelectTrigger>
            <SelectContent>
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
