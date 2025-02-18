'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserRole from './_components/user-role';
import AddUserPermission from './_components/add-user-permission';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { updateSearchParamsOnUrl } from '@/lib/url';

const RoleManagement = () => {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<string | undefined>(undefined);
  // const { role, session } = useStateVariables();

  useEffect(() => {
    const value = searchParams?.get('page');
    if (value && value !== tab) {
      setTab(value);
    }
  }, [searchParams, tab]);

  // role이 null이면 ADMIN(ADMIN이 아닌 권한은 진입불가)
  // if (!!role) return <NotPermission id={session?.user.id || ''} />;

  return (
    <Tabs
      value={tab}
      defaultValue="role"
      onValueChange={(v) => {
        updateSearchParamsOnUrl({ page: v });
      }}
    >
      <TabsList className="w-[24rem]" defaultValue="role">
        <TabsTrigger className="w-full" value="role">
          User Role
        </TabsTrigger>
        <TabsTrigger className="w-full" value="permission">
          Add User Permission
        </TabsTrigger>
      </TabsList>
      <TabsContent value="role" className="w-full">
        <UserRole />
      </TabsContent>
      <TabsContent value="permission" className="w-full">
        <AddUserPermission />
      </TabsContent>
    </Tabs>
  );
};

export default RoleManagement;
