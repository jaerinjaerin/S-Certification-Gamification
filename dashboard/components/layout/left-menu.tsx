'use client';
import {
  LayoutDashboard,
  Sheet,
  Users,
  NotebookPen,
  Images,
  Languages,
  Goal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useStateVariables } from '../provider/state-provider';
import { Campaign, Role } from '@prisma/client';
import { useEffect, useState } from 'react';

// 메뉴 데이터를 배열로 정의
const getMenuItems = (role: Role, campaign: Campaign | null): MenuItems => {
  // searchParams 최적화: campaign이 있을 때만 생성
  const searchParams = campaign
    ? `?date.from=${new Date(campaign.startedAt).toISOString()}&date.to=${new Date(campaign.endedAt).toISOString()}`
    : '';

  // 공통 URL 생성 함수
  const createUrl = (path: string) =>
    campaign ? `/dashboard/${campaign.id}${path}${searchParams}` : '';

  const dashboard = {
    title: 'Dashboard',
    items: [
      {
        label: 'Overview',
        icon: LayoutDashboard,
        href: createUrl('/overview'),
      },
      {
        label: 'User',
        icon: Users,
        href: createUrl('/user/stats'),
        // children: [
        //   {
        //     label: 'Stats',
        //     href: createUrl('/user/stats'),
        //   },
        // ],
      },
      {
        label: 'Quiz',
        icon: Sheet,
        href: createUrl('/quiz'),
      },
    ],
  };

  const cms = {
    title: 'CMS',
    items: [
      { label: 'Set Quiz', icon: NotebookPen, href: '/cms/set-quiz' },
      { label: 'Media Library', icon: Images, href: '/cms/media-library' },
      { label: 'UI Language', icon: Languages, href: '/cms/ui-language' },
      { label: 'Target', icon: Goal, href: '/cms/target' },
    ],
  };

  // role에 따른 반환 최적화
  if (role) return [dashboard];
  return [dashboard, cms];
};

// Menu 컴포넌트
const LeftMenu = () => {
  const router = useRouter();
  const { role, campaign } = useStateVariables();
  const pathname = usePathname();
  const [campaignData, setCampaignData] = useState<Campaign | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (campaign) {
      setCampaignData(campaign);
    }
  }, [campaign]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Sidebar variant="inset" collapsible="none">
      <SidebarContent className="p-2">
        {getMenuItems(role, campaignData).map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel asChild>
              <div className="!text-size-14px mx-2 my-0.5 mb-1">
                {group.title}
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {group.items.map((item, itemIndex) => {
                return (
                  <SidebarMenu key={itemIndex} className="mb-1">
                    {/* 상위 메뉴 */}
                    <SidebarMenuButton
                      isActive={item.href?.includes(pathname)}
                      disabled={!item?.children && !item?.href}
                      className="flex items-center justify-between !px-4 !py-6"
                      onClick={() => {
                        if (item?.children) {
                          toggleSection(item.label);
                        } else if (item?.href) {
                          router.push(item.href);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item?.children &&
                        (openSections[item.label] ? (
                          <ChevronUp className="size-[0.9375rem]" />
                        ) : (
                          <ChevronDown className="size-[0.9375rem]" />
                        ))}
                    </SidebarMenuButton>

                    {/* 자식 메뉴 */}
                    {item?.children && openSections[item.label] && (
                      <SidebarMenuItem className="space-y-1">
                        {item.children.map((child, childIndex) => (
                          <SidebarMenuButton
                            key={childIndex}
                            isActive={child.href?.includes(pathname)}
                            className="pl-11 py-5"
                            onClick={() => {
                              if (child?.href) router.push(child.href);
                            }}
                          >
                            {child.label}
                          </SidebarMenuButton>
                        ))}
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                );
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default LeftMenu;
