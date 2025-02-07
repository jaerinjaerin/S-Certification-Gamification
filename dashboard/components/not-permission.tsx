'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function NotPermission({ id }: { id: string }) {
  return (
    <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">Not Permission</h1>
          <p className="text-gray-500 pb-2">
            You don&apos;t have permission to access this page.
          </p>
          <code className="text-gray-500">id : {id}</code>
        </div>
        <form
          onSubmit={async (event) => {
            event.preventDefault();

            sessionStorage.clear();

            const callbackUrl = `${window.location.protocol}//${window.location.host}`;
            const signOutUrl = `${process.env.NEXT_PUBLIC_AUTH_SUMTOTAL_SIGNOUT}${callbackUrl}`;

            await signOut({
              redirect: false, // NextAuth의 기본 리디렉션을 방지
            });

            window.location.href = signOutUrl;
          }}
        >
          <Button className="cursor-pointer text-left">Sign out</Button>
        </form>
      </div>
    </div>
  );
}
