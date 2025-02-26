'use client';

import { IconSpinner, IconSplusMsg } from '@/components/icons/bien';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export function LoginButton({
  text = 'Login with SumTotal',
  showGithubIcon = true,
  ...props
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Button
      onClick={() => {
        setIsLoading(true);
        signIn('sumtotal', { callbackUrl: `/campaign` });
      }}
      disabled={isLoading}
      className="w-full"
      {...props}
    >
      {isLoading ? (
        <IconSpinner className="animate-spin" />
      ) : showGithubIcon ? (
        <IconSplusMsg inverted={true} />
      ) : null}
      {text}
    </Button>
  );
}
