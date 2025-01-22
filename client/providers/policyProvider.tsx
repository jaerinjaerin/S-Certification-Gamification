"use client";

import { createContext, useContext } from "react";

type PolicyContextType = {
  privacyContent: string;
  termContent: string;
  domainName: string;
};

type PolicyProviderProps = PolicyContextType & { children: React.ReactNode };

const PolicyContext = createContext<PolicyContextType | undefined>(undefined);

export const PolicyProvider = ({
  children,
  privacyContent,
  termContent,
  domainName,
}: PolicyProviderProps) => {
  return (
    <PolicyContext.Provider
      value={{
        privacyContent,
        termContent,
        domainName,
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
