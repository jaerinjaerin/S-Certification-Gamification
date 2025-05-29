import { cn } from "@/utils/utils";
import PolicyRenderer from "../policy-renderer";

export default function PolicyFooter({ className, domainCode }: { className?: string; domainCode: string }) {
  return (
    <div className={cn("font-medium text-sm", className)}>
      <PolicyRenderer view="dialog" dialogType="privacy" domainCode={domainCode} />
      <span className="mx-2">|</span>
      <PolicyRenderer view="dialog" dialogType="term" domainCode={domainCode} />
    </div>
  );
}
