import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { ModalProvider } from '@/components/provider/modal-provider';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import NotPermission from '@/components/not-permission';
import { getUserFromDB, getUserPermissions } from '@/model/qureries';
import { StateVariablesProvider } from '@/components/provider/state-provider';
import { Role } from '@prisma/client';
import { getCampaigns } from '../actions/campaign-action';
import { getFilter } from '../actions/dashboard/filter-action';

type Props = { children: React.ReactNode };

const ManagementLayout = async ({ children }: Props) => {
  const session = (await auth()) as Session;
  const { user } = session;
  const userFromDB = await getUserFromDB(user.id);
  let permit = true;
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
  const { result: campaigns = [] } = permit
    ? await getCampaigns(role?.name || 'ADMIN')
    : { result: [] };

  const filter = permit ? await getFilter() : null;

  return (
    <>
      {permit && (
        <StateVariablesProvider
          filter={filter}
          session={session}
          role={role}
          campaigns={campaigns as Campaign[]}
        >
          <ModalProvider>
            <SidebarProvider className="pt-[3.5rem]">
              {children}
            </SidebarProvider>
          </ModalProvider>
        </StateVariablesProvider>
      )}

      {!permit && <NotPermission id={user.id} />}
    </>
  );
};

export default ManagementLayout;
