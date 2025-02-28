import { useRouter } from 'next/navigation';

export function useNavigation() {
  const router = useRouter();

  const routeToPage = (path: string) => {
    console.log('Routing to:', path);
    router.push(path);
  };

  return { routeToPage };
}
