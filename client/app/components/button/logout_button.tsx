"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LogoutButton() {
  const [callbackUrl, setCallbackUrl] = useState("/login");

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const pathname = currentUrl.pathname;
    const eventName = pathname.split("/")[1];

    if (eventName) {
      setCallbackUrl(`/${eventName}/login`);
    } else {
      setCallbackUrl("/login");
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
