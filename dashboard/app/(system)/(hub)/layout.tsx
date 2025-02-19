import CurrentBreadCrumb from '@/components/system/current-bread-crumb';
import React from 'react';
import ContentWithTitleSection from '@/components/system/content-with-title-section';
import LeftMenu from '@/components/layout/left-menu';
import { SidebarInset } from '@/components/ui/sidebar';

type Props = { children: React.ReactNode };

const ManagementLayout = async ({ children }: Props) => {
  return (
    <>
      <aside>
        <LeftMenu />
      </aside>
      <SidebarInset>
        <div className="w-full p-5 space-y-5 ">
          <CurrentBreadCrumb />
          <div className="relative h-full w-full">
            <ContentWithTitleSection>{children}</ContentWithTitleSection>
          </div>
        </div>
      </SidebarInset>
    </>
  );
};

export default ManagementLayout;
