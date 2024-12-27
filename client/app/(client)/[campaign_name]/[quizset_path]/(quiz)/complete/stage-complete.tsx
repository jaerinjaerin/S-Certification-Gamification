import { useTranslations } from "next-intl";

export default function Stage({
  stageName,
  children,
}: {
  stageName: string;
  children: React.ReactNode;
}) {
  const translation = useTranslations("Completed");

  return (
    <div className="flex flex-col pt-10">
      <div>
        <h2 className="text-2xl">{translation("stage")}</h2>
        <h1 className="text-[50px]">{stageName}</h1>
      </div>
      {children}
    </div>
  );
}
