"use client";
import { BadgeCheck, User, UserCheck, Users } from "lucide-react";
import React from "react";

const icons = {
  user: User,
  userCheck: UserCheck,
  badgeCheck: BadgeCheck,
  users: Users,
} as const;

type Props = {
  title: string;
  iconName: keyof typeof icons;
  children: React.ReactNode;
};

const InfoCardStyleContainer = ({ title, iconName, children }: Props) => {
  const Icon = icons[iconName];
  return (
    <div className="relative border rounded-md p-4 flex-1">
      <div className="flex items-center justify-between text-zinc-900 font-bold">
        <div>{title}</div>
        <Icon className="size-4 text-zinc-500" />
      </div>
      {children}
    </div>
  );
};

export default InfoCardStyleContainer;
