"use client";

import { createContext, useContext } from "react";

interface PolicyContextType {
  privacyContent: string;
  termContent: string;
}

const PolicyContext = createContext<PolicyContextType | undefined>(undefined);

export const PolicyProvider = ({
  children,
  privacyContent,
  termContent,
}: {
  children: React.ReactNode;
  privacyContent: string;
  termContent: string;
}) => {
  return (
    <PolicyContext.Provider
      value={{
        privacyContent,
        termContent,
      }}
    >
      {children}
    </PolicyContext.Provider>
  );
};

export const usePolicy = () => {
  const context = useContext(PolicyContext);
  if (context === undefined) {
    throw new Error("usePolicy는 PolicyProvider 내에서만 사용할 수 있습니다.");
  }
  return context;
};
