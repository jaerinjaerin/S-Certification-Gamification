'use client';
import { useRouter } from 'next/navigation';

const Campaign = () => {
  const router = useRouter();
  return (
    <div
      className="flex items-center justify-center w-full text-7xl font-bold uppercase cursor-pointer"
      onClick={() => {
        router.push('/dashboard/overview');
      }}
    >
      Campaign
    </div>
  );
};

export default Campaign;
