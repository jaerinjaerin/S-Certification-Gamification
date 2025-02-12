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
  FileBadge2,
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
      { label: 'Policies & Terms', icon: FileBadge2, href: '/cms/policies' },
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
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarTrigger className="ml-auto" />
      <Separator />
      <SidebarContent className="p-2">
        {menuItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel asChild>
              <div className="!text-size-14px mx-2 my-0.5 mb-1">
                {group.title}
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {group.items.map((item, itemIndex) => {
                if (item.children) {
                  return (
                    <SidebarMenu key={itemIndex}>
                      <Collapsible asChild className="group/collapsible">
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              isActive={pathname === item.href}
                              tooltip={item.label}
                              onClick={() => {
                                setOpen(true);
                              }}
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.label}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child, childIndex) => (
                                <SidebarMenuSubItem key={childIndex}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === child.href}
                                  >
                                    <a href={child.href}>
                                      <span>{child.label}</span>
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

                return (
                  <SidebarMenu key={itemIndex}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.label}
                      >
                        <a href={item.href}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
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
