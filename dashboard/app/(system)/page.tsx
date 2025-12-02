import { redirect } from 'next/navigation';

export default function System() {
  redirect('/campaign');
  return null;
}
