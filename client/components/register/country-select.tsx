import { useRegisterForm } from "@/providers/register/register-form-provider";
import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CountrySelect() {
  const { countries, selectCountry, loading, loadingCreate, checkRegisteredLoading, selectedCountry } = useRegisterForm();
  const translation = useTranslations();
  return (
    <Select
      onValueChange={(value) => {
        selectCountry(value);
      }}
      value={`${translation("country")}*`}
    >
      <SelectTrigger
        disabled={loading || loadingCreate || countries == null || checkRegisteredLoading}
        className={cn(selectedCountry !== null && "bg-[#E5E5E5] text-[#5A5A5A]")}
      >
        <SelectValue>{selectedCountry === null ? `${translation("country")}*` : selectedCountry.name}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[220px] font-one font-medium">
        {countries.map((country, idx) => (
          <SelectItem key={idx} value={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
