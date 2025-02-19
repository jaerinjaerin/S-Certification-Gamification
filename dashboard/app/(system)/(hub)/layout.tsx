import CurrentBreadCrumb from '@/components/system/current-bread-crumb';
import React from 'react';
import ContentWithTitleSection from '@/components/system/content-with-title-section';
import LeftMenu from '@/components/layout/left-menu';

type Props = { children: React.ReactNode };

const ManagementLayout = async ({ children }: Props) => {
  return (
    <>
      {/* Sidebar hide left menu for temperately open  */}
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
    </>
  );
};

export default ManagementLayout;
