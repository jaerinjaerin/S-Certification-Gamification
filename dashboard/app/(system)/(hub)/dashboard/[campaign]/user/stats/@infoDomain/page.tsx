/* eslint-disable @typescript-eslint/no-unused-vars */
import { getUserDomain } from '@/app/actions/dashboard/user/action';
import UserDomainChild from './_children';
import { URLSearchParams } from 'url';

const UserDomain = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  // searchParams가 URLSearchParams인지 확인
  if (!(searchParams instanceof URLSearchParams)) {
    searchParams = new URLSearchParams(searchParams as any);
  }
  const page = (searchParams.get('domainPageIndex') as string | null) ?? '1';
  searchParams.set('take', '10');
  searchParams.set('page', page);
  const data = await getUserDomain(searchParams);

  return (
    <UserDomainChild
      data={data?.result || []}
      total={data?.total ?? 0}
      pageSize={parseInt((searchParams.get('take') as string) ?? 10)}
      pageIndex={parseInt(page)}
    />
  );
};

export default UserDomain;
