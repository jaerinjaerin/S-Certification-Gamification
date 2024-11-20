"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const currentUrl = new URL(window.location.href);
  const queryString = currentUrl.search;
  const callbackUrl = `/login${queryString}`;

  return (
    <div>
      <button onClick={() => signOut({ callbackUrl: callbackUrl })}>
        Sign out
      </button>
    </div>
  );
}
