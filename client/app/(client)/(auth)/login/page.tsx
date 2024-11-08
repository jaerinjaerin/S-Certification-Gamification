'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function Login() {
  const { data: session } = useSession();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleLogin = async () => {
    try {
      const result = await signIn('email', {
        email,
        redirect: false,
      });

      console.log('result', result);

      if (result?.error) {
        setError(`error: ${result.error}`);
      } else {
        setIsCodeSent(true); // 인증 코드가 전송된 경우
      }
    } catch (err) {
      console.error(err, typeof err);
      setError('Failed to send verification code.');
    }
  };

  if (session) {
    return (
      <>
        :) Signed in as {session.user?.email}
        <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <div>
      <h1>Quiz Login</h1>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Enter your email'
      />
      <button onClick={handleLogin}>Send Verification Code</button>
      <br />
      <button
        onClick={() =>
          signIn('google', { redirect: true, callbackUrl: '/home' })
        }
      >
        Sign in with Google
      </button>
      <br />
      <button
        onClick={() => {
          signIn('sumtotal', { callbackUrl: `/` });
        }}
      >
        Sign in with Sumtotal
      </button>
      {isCodeSent && <p>Verification code sent. Please check your email.</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
