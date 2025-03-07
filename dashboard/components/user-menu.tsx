'use client';

import { signOut } from 'next-auth/react';
import React from 'react';

import { IconExit } from '@/components/icons/bien';
import { SquareUser } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <SquareUser className="size-6 text-zinc-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={8}
          align="end"
          className="w-[14rem] bg-background px-3 py-5 dark:border-borderDark rounded-xl shadow-none border border-zinc-200 space-y-3"
        >
          <DropdownMenuItem className="flex-col items-start py-0 px-3">
            <span className="font-medium">User name</span>
            <span className="text-zinc-500">address@example.com</span>
          </DropdownMenuItem>
          {/* <DropdownMenuSeparator className="bg-border dark:bg-borderDark !my-1" /> */}
          <div className="flex flex-col flex-grow py-2 px-3 transition-colors focus:bg-accent focus:text-accent-foreground dark:hover:bg-[#27272A]">
            <form
              onSubmit={async (event) => {
                event.preventDefault();

                const callbackUrl = `${window.location.protocol}//${window.location.host}`;
                const signOutUrl = `${process.env.NEXT_PUBLIC_AUTH_SUMTOTAL_SIGNOUT}${callbackUrl}`;
                sessionStorage.clear();
                // 삼플 유저 로그아웃
                await signOut({
                  redirect: false, // NextAuth의 기본 리디렉션을 방지
                });
                window.location.href = signOutUrl;
              }}
              className="flex items-center size-7 select-none w-full"
            >
              <button
                className={cn(
                  'relative text-size-14px flex w-full gap-3 cursor-pointer select-none items-center',
                  'rounded-sm outline-none ',
                  '',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                )}
              >
                <IconExit className="shrink-0 dark:hidden size-[1.125rem]" />
                <span className="text-nowrap font-medium">{'Logout'}</span>
              </button>
            </form>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
