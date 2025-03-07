import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { auth } from '@/auth';

export default async function Login() {
  const session = await auth();
  // redirect to home if user is already logged in
  if (session?.user) {
    redirect('/campaign');
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
