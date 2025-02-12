import CurrentBreadCrumb from '@/components/system/current-bread-crumb';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import ContentWithTitleSection from '@/components/system/content-with-title-section';
import { ModalProvider } from '@/components/provider/modal-provider';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import NotPermission from '@/components/not-permission';
import { getUserFromDB, getUserPermissions } from '@/model/qureries';
import LeftMenu from '@/components/layout/left-menu';

type Props = { children: React.ReactNode };

const ManagementLayout = async ({ children }: Props) => {
  const session = (await auth()) as Session;
  const { user } = session;
  const userFromDB = await getUserFromDB(user.id);
  let permit = false;
  if (userFromDB) {
    const permissions = await getUserPermissions(userFromDB);
    console.log(permissions);
    permit = permissions.includes('Global');
    // permit = true;
  }

  return (
    <>
      {permit && (
        <ModalProvider>
          <SidebarProvider className="pt-[3.5rem]">
            <LeftMenu />
            <SidebarInset>
              <div className="w-full p-5 space-y-5 ">
                <CurrentBreadCrumb />
                <div className="relative h-full w-full">
                  <ContentWithTitleSection>{children}</ContentWithTitleSection>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </ModalProvider>
      )}

      {!permit && <NotPermission id={user.id} />}
    </>
  );
};

export default ManagementLayout;
