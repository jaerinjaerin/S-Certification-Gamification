/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Role } from '@prisma/client';
import axios from 'axios';
import { Session } from 'next-auth';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

type StateVariables = {
  filter: AllFilterData | null;
  session: Session | null;
  role: (Role & any) | null;
};

const StateVariablesContext = createContext<StateVariables | undefined>(
  undefined
);

export const StateVariablesProvider = ({
  children,
  session,
  role,
}: {
  children: ReactNode;
  session: Session | null;
  role: (Role & any) | null;
}) => {
  const [filter, setFilter] = useState<AllFilterData | null>(null);

  useEffect(() => {
    axios.get('/api/dashboard/filter').then((res) => {
      setFilter(res.data);
    });
  }, []);

  return (
    <StateVariablesContext.Provider value={{ filter, session, role }}>
      {children}
    </StateVariablesContext.Provider>
  );
};

// Custom hook for consuming the global state
export const useStateVariables = () => {
  const context = useContext(StateVariablesContext);
  if (!context) {
    throw new Error(
      'useStateVariables must be used within a StateVariablesProvider'
    );
  }
  return context;
};
