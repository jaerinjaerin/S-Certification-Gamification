import { redirect } from 'next/navigation';

export default function System() {
  redirect('/dashboard/overview');
  return null;
}
