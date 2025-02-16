import CurrentBreadCrumb from '@/components/system/current-bread-crumb';
import Topbar from '@/components/layout/top-bar';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import ContentWithTitleSection from '@/components/system/content-with-title-section';
import { ModalProvider } from '@/components/provider/modal-provider';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import NotPermission from '@/components/not-permission';
import { getUserFromDB, getUserPermissions } from '@/model/qureries';
import LeftMenu from '@/components/layout/left-menu';
import { StateVariablesProvider } from '@/components/provider/state-provider';
import { Role } from '@prisma/client';

type Props = { children: React.ReactNode };

const ManagementLayout = async ({ children }: Props) => {
  const session = (await auth()) as Session;
  const { user } = session;
  const userFromDB = await getUserFromDB(user.id);
  let permit = false;
  let role: Role | null = null;
  if (userFromDB) {
    role = await getUserPermissions(userFromDB);
    permit = !!role;
    //
    // 권한이 ADMIN일때는 모두 노출 (permission 데이터 필요없음)
    if (role?.name === 'ADMIN') {
      role = null;
    }
  }

  return (
    <>
      {permit && (
        <StateVariablesProvider session={session} role={role}>
          <ModalProvider>
            <SidebarProvider className="flex flex-col overflow-x-auto overflow-y-hidden">
              <Topbar className="bg-zinc-950 h-14 w-full flex items-center justify-between flex-shrink-0 px-[1.875rem]" />
              <div className="flex flex-1 h-full">
                {/* Sidebar hide left menu for temperately open  */}
                <aside className="relative w-[16.5rem] bg-zinc-50">
                  <LeftMenu />
                </aside>

                {/* Main Content */}
                <div className="w-full p-5 space-y-5">
                  <CurrentBreadCrumb />
                  <div className="relative h-full w-full">
                    <ContentWithTitleSection>
                      {children}
                    </ContentWithTitleSection>
                  </div>
                </div>
              </div>
            </SidebarProvider>
          </ModalProvider>
        </StateVariablesProvider>
      )}

      {!permit && <NotPermission id={user.id} />}
    </>
  );
};

export default ManagementLayout;
