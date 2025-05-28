import { RegisterFormProvider } from "@/providers/register/register-form-provider";

export default function RegisterLayout({ children, params: { campaign_name } }: { children: React.ReactNode; params: { campaign_name: string } }) {
  return <RegisterFormProvider campaignName={campaign_name}>{children}</RegisterFormProvider>;
}
