import { redirect } from 'next/navigation';

export default function ContentManagementSystem() {
  redirect('/cms/set-quiz');
  return null;
}
