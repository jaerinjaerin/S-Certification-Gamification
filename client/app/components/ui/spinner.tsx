import { SpinnerIcon } from "@/app/components/icons/icons";

export default function Spinner() {
  return (
    <div className="flex justify-center">
      <span className="animate-loading">
        <SpinnerIcon className="size-8" />
      </span>
    </div>
  );
}
