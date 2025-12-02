import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";
import useCheckLocale from "@/hooks/useCheckLocale";

type RegisterFormBaseProps = {
  children: React.ReactNode;
};

export function RegisterFormBackground({ children }: RegisterFormBaseProps) {
  return (
    <div
      className="py-[20px] min-h-svh flex items-center justify-center"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/common/images/main_bg2.jpg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
}

export function RegisterFormContainer({ children }: RegisterFormBaseProps) {
  const translation = useTranslations();
  const { isArabic } = useCheckLocale();
  return (
    <div
      className={cn(
        "gap-[26px] flex flex-col justify-center items-center bg-background",
        "px-[25px] pb-[50px] pt-[62px]",
        "w-[250px] sm:w-[340px]",
        "rounded-[20px] border shadow-lg duration-200"
      )}
    >
      {/* header */}
      <div className="flex flex-col space-y-[26px] text-center w-full">
        <h1 className="text-2xl">{translation("enter_details")}</h1>
        <p className={cn("text-left text-muted-foreground font-one font-medium text-base  block", isArabic && "text-right")}>
          {translation("select_information")}
          <span className="block text-[#0037FF]">{translation("mandatory_fields")}</span>
        </p>
      </div>
      {children}
    </div>
  );
}

export function RegisterFormComboboxContainer({ children }: RegisterFormBaseProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full gap-[14px] font-one font-medium",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95",
        "data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
      )}
    >
      {children}
    </div>
  );
}
