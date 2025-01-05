"use client";
import {
  LayoutDashboard,
  Users,
  Sheet,
  NotebookPen,
  Tag,
  Images,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { useRouter } from "next/navigation";

// 메뉴 데이터를 배열로 정의
const menuItems: MenuItems = [
  {
    title: "Dashboard",
    items: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard/overview" },
      { label: "User", icon: Users, href: "/dashboard/user" },
      { label: "Quiz", icon: Sheet, href: "/dashboard/quiz" },
    ],
  },
  {
    title: "CMS",
    items: [
      {
        label: "Questions",
        icon: NotebookPen,
        // children: [
        //   { label: "Question 1", href: "/questions/1" },
        //   { label: "Question 2", href: "/questions/2" },
        // ],
      },
      { label: "Certification", icon: Tag, href: "" },
      { label: "Media Library", icon: Images, href: "" },
      {
        label: "Settings",
        icon: Settings2,
        // children: [
        //   { label: "Profile", href: "/settings/profile" },
        //   { label: "Security", href: "/settings/security" },
        //   { label: "Notifications", href: "/settings/notifications" },
        // ],
      },
    ],
  },
];

// Menu 컴포넌트
const LeftMenu = () => {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Sidebar variant="inset" collapsible="none">
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
                return (
                  <SidebarMenu key={itemIndex}>
                    {/* 상위 메뉴 */}
                    <SidebarMenuButton
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
                        <item.icon className="w-5 h-5 text-zinc-600" />
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
                      <SidebarMenuItem className="pl-6">
                        {item.children.map((child, childIndex) => (
                          <SidebarMenuButton
                            key={childIndex}
                            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800"
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
