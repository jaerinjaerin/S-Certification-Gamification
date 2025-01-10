"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LogoutButton() {
  const [callbackUrl, setCallbackUrl] = useState("/logout");

  useEffect(() => {
    // setCallbackUrl("/logout");
    const pathname = window.location.pathname; // 현재 경로 가져오기
    const firstPath = pathname.split("/")[1]; // 첫 번째 경로 값 추출

    console.log("pathname:", pathname);

    if (firstPath) {
      setCallbackUrl(`/${firstPath}/logout`);
    } else {
      setCallbackUrl("/logout");
    }
  }, []);

  return (
    <div>
      <button onClick={() => signOut({ callbackUrl: callbackUrl })}>
        Sign out
      </button>
    </div>
  );
}
