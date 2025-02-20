'use client';
import {
  LayoutDashboard,
  Sheet,
  Users,
  NotebookPen,
  Images,
  Languages,
  Goal,
  ChevronRight,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

import { usePathname } from 'next/navigation';
import { Separator } from '../ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { cn } from '@/lib/utils';

// 메뉴 데이터를 배열로 정의
const menuItems: MenuItems = [
  {
    title: 'Dashboard',
    items: [
      { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/overview' },
      {
        label: 'User',
        icon: Users,
        children: [{ label: 'Stats', href: '/dashboard/user/stats' }],
      },
      { label: 'Quiz', icon: Sheet, href: '/dashboard/quiz' },
    ],
  },
  {
    title: 'CMS',
    items: [
      { label: 'Set Quiz', icon: NotebookPen, href: '/cms/set-quiz' },
      { label: 'Media Library', icon: Images, href: '/cms/media-library' },
      { label: 'UI Language', icon: Languages, href: '/cms/ui-language' },
      { label: 'Target', icon: Goal, href: '/cms/target' },
    ],
  },
];

// Menu 컴포넌트
const LeftMenu = () => {
  // const router = useRouter();
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  // const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // const toggleSection = (label: string) => {
  //   setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  // };

  return (
    <Sidebar className="!p-0" variant="sidebar" collapsible="icon">
      <SidebarTrigger className="group-data-[collapsible=icon]:mx-auto my-[10px] ml-auto mr-5" />
      <Separator />
      <SidebarContent className="!gap-0 px-3 pb-3">
        {menuItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex} className="px-0 pb-0 pt-4 gap-3">
            <SidebarGroupLabel className="mx-5 my-[5px] h-[27px] p-0" asChild>
              <div className="!text-size-14px text-sidebar-text">
                {group.title}
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-[3px]">
              {group.items.map((item, itemIndex) => {
                if (item.children) {
                  return (
                    <SidebarMenu key={itemIndex}>
                      <Collapsible asChild className="group/collapsible">
                        <SidebarMenuItem className="flex flex-col gap-[3px]">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className={cn(
                                /* w h p m */ 'rounded-[10px] h-11 pl-5 justify-between group-data-[state=collapsed=icon]:!w-full group-data-[collapsible=icon]:gap-0 group-data-[state=collapsed]:!p-4 group-data-[collapsible=icon]:!h-11 group-data-[state=collapsed]:!w-full',
                                /* rounded */ 'group-data-[collapsible=icon]:!rounded-[10px] data-[active=true]:!rounded-[10px] active:!rounded-[10px] hover:rounded-[10px]',
                                /* color */ 'data-[state=open]:!bg-sidebar-active data-[state=open]:!text-sidebar-active-text active:!bg-sidebar-active hover:bg-sidebar-active data-[active=true]:!bg-sidebar-active hover:text-sidebar-active-text active:text-sidebar-active-text data-[active=true]:text-sidebar-active-text'
                              )}
                              isActive={pathname === item.href}
                              tooltip={item.label}
                              onClick={() => {
                                setOpen(true);
                              }}
                            >
                              <div className="flex gap-3">
                                <i>
                                  <item.icon />
                                </i>
                                <span className="group-data-[state=collapsed]:pl-4">
                                  {item.label}
                                </span>
                              </div>

                              <ChevronRight className="size-6 !mr-2 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub className="border-none w-full m-0 p-0">
                              {item.children.map((child, childIndex) => (
                                <SidebarMenuSubItem key={childIndex}>
                                  <SidebarMenuSubButton
                                    className={cn(
                                      'h-11 rounded-[10px] active:rounded-[10px] hover:rounded-[10px] data-[active=true]:!rounded-[10px]',
                                      'hover:bg-sidebar-active active:bg-sidebar-active data-[active=true]:!bg-sidebar-active'
                                    )}
                                    asChild
                                    isActive={pathname === child.href}
                                  >
                                    <a href={child.href}>
                                      <span className="text-sidebar-active-text pl-12 data-[active=true]:text-sidebar-active-text">
                                        {child.label}
                                      </span>
                                    </a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    </SidebarMenu>
                  );
                }
                // group-data-[state=collapsed]:gap-20

                return (
                  <SidebarMenu key={itemIndex}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className={cn(
                          /* w h p m */ 'h-11 pl-5 gap-3 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:!p-4 group-data-[collapsible=icon]:!h-11 ',
                          /* rounded */ 'group-data-[collapsible=icon]:!rounded-[10px] data-[active=true]:!rounded-[10px] active:!rounded-[10px] hover:rounded-[10px]',
                          /* color */ 'active:bg-sidebar-active hover:bg-sidebar-active data-[active=true]:bg-sidebar-active active:text-sidebar-active-text hover:text-sidebar-active-text data-[active=true]:text-sidebar-active-text'
                        )}
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.label}
                      >
                        <a href={item.href}>
                          <i>
                            <item.icon />
                          </i>

                          <span className="group-data-[state=collapsed]:pl-4">
                            {item.label}
                          </span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
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
