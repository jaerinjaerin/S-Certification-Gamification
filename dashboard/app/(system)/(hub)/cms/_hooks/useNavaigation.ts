import { useRouter } from 'next/navigation';

export function useNavigation() {
  const router = useRouter();

  const routeToPage = (path: string) => {
    router.push(path);
  };

  return { routeToPage };
}
