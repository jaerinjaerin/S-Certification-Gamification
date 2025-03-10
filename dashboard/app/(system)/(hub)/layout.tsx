import dynamic from 'next/dynamic';
import React from 'react';
import ContentWithTitleSection from '@/components/system/content-with-title-section';
import LeftMenu from '@/components/layout/left-menu';
import { SidebarInset } from '@/components/ui/sidebar';

// CurrentBreadCrumb을 클라이언트 사이드에서만 렌더링하도록 설정
const CurrentBreadCrumb = dynamic(
  () => import('@/components/system/current-bread-crumb'),
  { ssr: false }
);

type Props = { children: React.ReactNode };

const ManagementLayout = ({ children }: Props) => {
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
