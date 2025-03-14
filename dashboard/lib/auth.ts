import { signOut } from 'next-auth/react';

export const logout = async () => {
  if (window) {
    const callbackUrl = `${window.location.protocol}//${window.location.host}`;
    const signOutUrl = `${process.env.NEXT_PUBLIC_AUTH_SUMTOTAL_SIGNOUT}${callbackUrl}`;
    sessionStorage.clear();
    // 삼플 유저 로그아웃
    await signOut({
      redirect: false, // NextAuth의 기본 리디렉션을 방지
    });
    window.location.href = signOutUrl;
  }
};
