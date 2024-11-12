'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  const processSignOut = async () => {
    await signOut();
  };

  const goTestPage = async () => {
    window.location.href = '/test';
  };

  if (session) {
    return (
      <>
        Signed in :)
        <br />
        <button onClick={() => goTestPage()}>Go Api Test Page</button>
        <br />
        <button onClick={() => processSignOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
