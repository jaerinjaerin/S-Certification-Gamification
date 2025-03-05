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
import { Separator } from '../ui/separator';
import { useNavigation } from '@/app/(system)/(hub)/cms/_hooks/useNavigation';

const CurrentBreadCrumb = () => {
  const { campaigns, campaign, setCampaign } = useStateVariables();
  const { routeToPage } = useNavigation();
  const pathname = usePathname();
  const paths = pathname
    .split('/')
    .filter(Boolean)
    .map((name) => name.replaceAll('-', ' '));

  const handleChangeCampaign = (value: string) => {
    if (!campaigns) return;
    //
    if (value === 'certification-list') {
      routeToPage('/');
      return;
    }
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
              <SelectItem
                value="certification-list"
                className="text-base font-bold"
              >
                Certification List
              </SelectItem>
              <Separator className="my-1" />
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
