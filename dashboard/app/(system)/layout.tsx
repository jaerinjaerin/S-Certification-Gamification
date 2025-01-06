import ContentWithTitleSection from "@/components/system/content-with-title-section";
import CurrentBreadCrumb from "@/components/layout/current-bread-crumb";
import LeftMenu from "@/components/layout/left-menu";
import Topbar from "@/components/layout/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

type Props = { children: React.ReactNode };

const ManagementLayout = ({ children }: Props) => {
  return (
    <SidebarProvider className="flex flex-col h-screen">
      <Topbar className="bg-zinc-950 h-14 w-screen flex items-center justify-between px-[1.875rem]" />
      <div className="flex flex-1 h-full">
        {/* Sidebar */}
        <aside className="relative w-[16.5rem] bg-zinc-50">
          <LeftMenu />
        </aside>

        {/* Main Content */}
        <div className="w-full p-5 space-y-5">
          <CurrentBreadCrumb />
          <div className="relative h-full w-full">
            <ContentWithTitleSection>{children}</ContentWithTitleSection>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ManagementLayout;
