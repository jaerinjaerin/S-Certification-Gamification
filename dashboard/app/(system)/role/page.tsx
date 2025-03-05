'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserRole from './_components/user-role';
import AddUserPermission from './_components/add-user-permission';
import { useState } from 'react';
import { useStateVariables } from '@/components/provider/state-provider';
import { notFound } from 'next/navigation';

const RoleManagement = () => {
  const [tab, setTab] = useState<string | undefined>(undefined);
  const { role } = useStateVariables();

  // 어드민 권한이 아니면 빈페이지 반환
  if (role) {
    notFound();
  }

  return (
    <div className="p-10 w-full flex justify-center border">
      <Tabs
        className="w-full max-w-screen-xl"
        value={tab}
        defaultValue="role"
        onValueChange={setTab}
      >
        <TabsList className="w-[24rem]">
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
    </div>
  );
};

export default RoleManagement;
