import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavigationHook {
  routeToPage: (path: string) => void;
  isRouting: boolean;
}

export const useNavigation = (): NavigationHook => {
  const router = useRouter();
  const [isRouting, setIsRouting] = useState(false);

  const routeToPage = (path: string) => {
    setIsRouting(true);
    router.push(path);
  };

  return { routeToPage, isRouting };
};
