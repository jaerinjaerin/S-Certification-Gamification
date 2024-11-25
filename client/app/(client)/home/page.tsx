"use client";

import { signOut } from "next-auth/react";

export default function Home() {
  // const { data: session, status } = useSession();

  // if (status === 'loading') {
  //   return <p>Loading...</p>;
  // }

  // if (status === 'unauthenticated') {
  //   // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  //   if (typeof window !== 'undefined') {
  //     window.location.href = '/auth/login';
  //   }
  //   return null;
  // }

  return (
    <div>
      {/* <h1>Welcome, {session?.user?.email}</h1> */}
      <h1>Home</h1>
      <p>인증제 퀴즈 설명</p>
      <button
        onClick={() => {
          // (window.location.href = '/map')
        }}
      >
        퀴즈 풀기
      </button>
      <br />
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
