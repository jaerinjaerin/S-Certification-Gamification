import { useNavigation } from '@/app/(system)/(hub)/cms/_hooks/useNavigation';
import { UserMenu } from '@/components/user-menu';
import { Button } from '../ui/button';

const Topbar = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { routeToPage } = useNavigation();
  return (
    <div {...props}>
      <Button
        className="flex items-center font-medium"
        variant={'link'}
        onClick={() => routeToPage('/campaign')}
      >
        <img src="/assets/svg/logo.svg" alt="logo" className="size-8" />
        <span className="font-roboto font-bold text-white top-[0.05rem] relative text-size-18px">
          Certification Admin
        </span>
      </Button>
      <UserMenu className="col-span-2 justify-end" />
    </div>
  );
};

export default Topbar;
