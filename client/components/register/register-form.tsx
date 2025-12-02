import ChannelSelect from "./channel-select";
import CountrySelect from "./country-select";
import JobSelect from "./job-select";
import LanguageSelect from "./language-select";

export default function RegisterForm() {
  return (
    <>
      <CountrySelect />
      <ChannelSelect />
      <JobSelect />
      <LanguageSelect />
    </>
  );
}
