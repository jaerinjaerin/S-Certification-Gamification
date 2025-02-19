import { redirect } from 'next/navigation';

export default function System() {
  redirect('/dashboard/user/stats');
  return null;
}
