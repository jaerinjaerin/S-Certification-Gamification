import { useRegisterForm } from "@/providers/register/register-form-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useTranslations } from "next-intl";

export default function LanguageSelect() {
  const { quizLanguages, setQuizLanguageCode, quizLanguageCode, loading, loadingCreate, selectedChannel, channelName, selectedJobId } =
    useRegisterForm();
  const translation = useTranslations();

  return (
    <>
      {quizLanguages && quizLanguages.length > 0 && (
        <Select onValueChange={(value) => setQuizLanguageCode(value)} value={quizLanguageCode || ""}>
          <SelectTrigger
            disabled={
              loading || loadingCreate || (selectedChannel === null && (channelName === null || channelName.trim().length < 1)) || !selectedJobId
            }
          >
            <SelectValue placeholder={translation("quiz_language")} />
          </SelectTrigger>
          <SelectContent className="font-medium font-one">
            {quizLanguages.map((lang) => (
              <SelectItem key={lang.name} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  );
}
