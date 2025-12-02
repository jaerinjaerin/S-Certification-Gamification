import { useRegisterForm } from "@/providers/register/register-form-provider";
import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCheckLocale from "@/hooks/useCheckLocale";

export default function ChannelSelect() {
  const { channels, selectChannel, loading, loadingCreate, channelInput, setChannelName, selectedChannel } = useRegisterForm();
  const translation = useTranslations();
  const { isArabic } = useCheckLocale();

  return (
    <Select
      onValueChange={(value) => {
        selectChannel(value);
      }}
      value={`${translation("channel")}*`}
    >
      <SelectTrigger
        disabled={loading || loadingCreate || channels == null}
        className={cn(selectedChannel !== null && "bg-[#E5E5E5] text-[#5A5A5A]")}
      >
        <SelectValue>{selectedChannel === null ? `${translation("channel")}*` : selectedChannel.name}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[220px] font-one font-medium">
        {channels?.map((channel) => (
          <SelectItem key={channel.name} value={channel.name}>
            {channel.name}
          </SelectItem>
        ))}

        <SelectItem value={"input_directly"}>{translation("input_directly")}</SelectItem>
      </SelectContent>
      {channelInput && (
        <input
          type="text"
          className={cn(
            "relative flex w-full h-[52px] cursor-default select-none items-center py-[10px] px-5 rounded-[10px] border border-input outline-none bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 placeholder:text-[#5A5A5A]",
            isArabic && "text-right"
          )}
          placeholder={translation("input_directly")}
          onChange={(e) => {
            const value = e.target.value.trim();
            setChannelName(value);
          }}
        />
      )}
    </Select>
  );
}
