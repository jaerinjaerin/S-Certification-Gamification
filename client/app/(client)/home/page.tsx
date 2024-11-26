"use client";

import { signOut } from "next-auth/react";

export default function Home() {
  return (
    <div>
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
