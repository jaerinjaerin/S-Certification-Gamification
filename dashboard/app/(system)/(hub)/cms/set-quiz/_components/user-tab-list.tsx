import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dispatch, SetStateAction } from 'react';
import { UserTabState } from '../_store/quizset-state';

export function UserTabList({
  setTabState,
}: {
  setTabState: Dispatch<SetStateAction<UserTabState>>;
}) {
  return (
    <Tabs
      defaultValue="s"
      className="w-[400px]"
      onValueChange={(value) => {
        setTabState(value as 's' | 'non-s');
      }}
    >
      <TabsList>
        <TabsTrigger className="min-w-[148px]" value="s">
          S+ Users
        </TabsTrigger>
        <TabsTrigger className="min-w-[148px]" value="non-s">
          Non S+ Users
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
