import { useRegisterForm } from "@/providers/register/register-form-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export default function JobSelect() {
  const { jobs, selectJob, loading, loadingCreate, selectedJobId, selectedChannel, channelName } = useRegisterForm();
  const translation = useTranslations();

  return (
    <Select onValueChange={(value) => selectJob(value)} value={selectedJobId || ""}>
      <SelectTrigger disabled={loading || loadingCreate || (selectedChannel === null && (channelName === null || channelName.trim().length < 1))}>
        <SelectValue placeholder={translation("job_group")} />
      </SelectTrigger>
      <SelectContent className="font-medium font-one">
        {jobs.map((job) => (
          <SelectItem key={job.value} value={job.value}>
            {job.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
