import { SquareUser } from "lucide-react";

const Topbar = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props}>
      <div className="flex items-center text-size-18px font-medium space-x-2">
        <img src="/assets/svg/logo.svg" alt="logo" className="size-8" />
        <span className="font-roboto font-bold text-white top-[0.05rem] relative">
          Certification
        </span>
      </div>
      <SquareUser className="size-6 text-zinc-50" />
    </div>
  );
};

export default Topbar;
