"use client";

// import { useLocalStorage } from "@/providers/local_storage_provider";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { status, data: session } = useSession();
  console.log("Home session", session);
  if (session) {
    return (
      <>
        :) Signed in as {session.user?.email}
        <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  const processSignIn = async () => {
    const result = await signIn("sumtotal");
    console.log("result", result);
  };

  return (
    <div>
      <h1>Sumtotal Test Login</h1>
      <button
        onClick={() => {
          processSignIn();
        }}
        disabled={status === "loading"}
      >
        Sign in with Sumtotal
      </button>
      {status === "loading" && <p>Loading...</p>}
    </div>
  );
}
