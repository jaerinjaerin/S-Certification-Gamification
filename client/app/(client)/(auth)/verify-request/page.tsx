'use client';

import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  console.log('session:', session, status);
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // if (status === 'unauthenticated') {
  //   // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  //   if (typeof window !== 'undefined') {
  //     window.location.href = '/auth/login';
  //   }
  //   return null;
  // }

  return (
    <div>
      <h1>인증코드를 발송하였습니다.</h1>
    </div>
  );
}
