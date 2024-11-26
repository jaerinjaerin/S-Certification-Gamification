"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LogoutButton() {
  const [callbackUrl, setCallbackUrl] = useState("/login");

  useEffect(() => {
    setCallbackUrl("logout");
  }, []);

  return (
    <div>
      <button onClick={() => signOut({ callbackUrl: callbackUrl })}>
        Sign out
      </button>
    </div>
  );
}
