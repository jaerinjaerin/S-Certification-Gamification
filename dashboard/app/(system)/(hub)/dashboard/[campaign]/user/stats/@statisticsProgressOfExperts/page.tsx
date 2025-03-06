import { getUserExpertsProgress } from '@/app/actions/dashboard/user/action';
import UserProgressExpertsChild from './_children';
import { URLSearchParams } from 'url';

export async function UserProgressExperts({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const data = await getUserExpertsProgress(searchParams);

  return <UserProgressExpertsChild data={data} />;
}

export default UserProgressExperts;
