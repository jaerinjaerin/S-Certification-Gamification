"use client";

import useGuestRegisterForm from "@/hooks/register/useGuestRegisterForm";
import { createContext, useContext } from "react";

const RegisterFormContext = createContext<ReturnType<typeof useGuestRegisterForm> | null>(null);

export function RegisterFormProvider({ children, campaignName }: { children: React.ReactNode; campaignName: string }) {
  const form = useGuestRegisterForm(campaignName);
  return <RegisterFormContext.Provider value={form}>{children}</RegisterFormContext.Provider>;
}

export const useRegisterForm = () => {
  const context = useContext(RegisterFormContext);
  if (!context) {
    throw new Error("useRegisterForm must be used within a RegisterFormProvider");
  }

  return context;
};
