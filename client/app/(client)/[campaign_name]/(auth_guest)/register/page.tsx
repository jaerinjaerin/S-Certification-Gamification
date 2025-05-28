"use client";
// React
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Next-auth
import { useSession } from "next-auth/react";

// Next-intl
import { useLocale, useTranslations } from "next-intl";

// Components
import { ResultAlertDialog } from "@/components/dialog/result-alert-dialog";
import LoginButton from "@/components/login/login-button";
import PolicyRenderer from "@/components/policy-renderer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";

// Hooks
import useGAPageView from "@/core/monitoring/ga/usePageView";
import useCheckLocale from "@/hooks/useCheckLocale";
import useCreateItem from "@/hooks/useCreateItem";
import useDomainRegionInfo from "@/hooks/useGetDomainInfo";

// Services
import { fetchQuizLog } from "@/services/quizService";

// Utils
import { cn } from "@/utils/utils";
import assert from "assert";

// Constants
import { ERROR_CODES } from "@/constants/error-codes";

// Providers
import { useCampaign } from "@/providers/campaignProvider";

// Types
import { UserQuizLog } from "@prisma/client";

interface Job {
  name: string;
  group: string;
  id: string;
  value: string;
  storeId?: string;
}

interface Channel {
  name: string;
  job: Job;
  channelId: string;
  channelSegmentId: string;
}

interface QuizLanguage {
  id: string;
  code: string;
  name: string;
}

interface JobQuizLanguage {
  ff: QuizLanguage[];
  fsm: QuizLanguage[];
}

interface DomainDetail {
  id: string;
  channels: Channel[];
  name: string;
  code: string;
  regionId: string;
  subsidiaryId: string;
  isReady: false;
  languages: JobQuizLanguage;
}

export default function GuestRegisterPage({ params }: { params: { campaign_name: string } }) {
  useGAPageView();
  const router = useRouter();

  const { data: session, status } = useSession();
  const translation = useTranslations();
  const { campaign } = useCampaign();
  const locale = useLocale();
  const { isArabic } = useCheckLocale();

  // state
  const [selectedCountry, setSelectedCountry] = useState<DomainDetail | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [selectedChannelSegmentId, setSelectedChannelSegmentId] = useState<string | null>(null);
  const [channelInput, setChannelInput] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [languageCode, setLanguageCode] = useState<string | undefined>(undefined); // 브라우저에서 주는 언어코드
  const [quizLanguageCode, setQuizLanguageCode] = useState<string | null>(null); // 브라우저에서 주는 언어코드

  // select box options
  const [countries, setCountries] = useState<DomainDetail[]>([]);
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const defaultJobs: Job[] = [
    { name: "FSM", group: "fsm", value: "8", id: "8" },
    { name: "FF", group: "ff", value: "9", id: "9" },
    { name: "FSM(SES)", group: "fsm", value: "10", id: "8", storeId: "4" },
    { name: "FF(SES)", group: "ff", value: "11", id: "9", storeId: "4" },
  ];
  const [jobs, setJobs] = useState<Job[]>(defaultJobs);
  const [quizLanguages, setQuizLanguages] = useState<QuizLanguage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkRegisteredLoading, setCheckRegisteredLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { openSheet, setOpenSheet, isPolicyAcceptCountry } = useDomainRegionInfo(selectedCountry?.code);

  const handleClickLoginButton = async () => {
    if (isPolicyAcceptCountry) {
      setOpenSheet(true);
    } else {
      await routeQuizPage();
    }
  };

  const fetchConutries = async () => {
    try {
      setLoading(true);

      const jsonUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/${params.campaign_name}/jsons/channels.json`;
      console.log("jsonUrl", jsonUrl);
      const res = await fetch(jsonUrl, {
        method: "GET",
      });

      const data = await res.json();
      data.sort((a: DomainDetail, b: DomainDetail) => {
        return a.name.localeCompare(b.name);
      });
      console.log("data", data.length);
      const countries = data as DomainDetail[];
      const readyCountries = countries.filter((c) => c.isReady);
      setCountries(readyCountries);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguage = async () => {
    const matchedLocale = locale === "es-419" ? "es-LTN" : locale;
    console.log("matchedLocale", matchedLocale);
    setLanguageCode(matchedLocale);
  };

  useEffect(() => {
    fetchConutries();
    fetchLanguage();
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      checkRegistered(session?.user.id);
    }
  }, [session?.user.id]);

  const { isLoading: loadingCreate, error: errorCreate, item: campaignPath, createItem } = useCreateItem<string>();

  useEffect(() => {
    if (campaignPath) {
      router.push(`${campaignPath}/map`);
    }
  }, [campaignPath]);

  const checkRegistered = async (userId: string) => {
    console.log("checkRegistered", userId);
    try {
      setCheckRegisteredLoading(true);
      const quizLogResponse = await fetchQuizLog(userId, campaign.name.toLowerCase() === "s25" ? campaign.name : campaign.slug);
      const quizLog: UserQuizLog | null = quizLogResponse.item?.quizLog || null;

      if (quizLog) {
        router.push(`${quizLog.quizSetPath}/map`);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      console.log("setCheckRegisteredLoading", false);
      setCheckRegisteredLoading(false);
    }
  };

  const oldCampaign = (): boolean => {
    if (params.campaign_name.toLowerCase() === "s25") {
      return true;
    }

    return false;
  };

  const selectCountry = (countryCode: string) => {
    const country = countries.find((d) => d.code === countryCode);
    if (!country) {
      assert(false, "Country not found. Please select a valid country.");
    }
    setSelectedCountry(country!);
    const channels = country!.channels;
    console.log("channels", channels);
    setChannels(channels ?? []);
    setSelectedChannel(null);
    setChannelInput(false);
    setChannelName(null);
    setSelectedJobId(null);
    setQuizLanguageCode(null);

    if (oldCampaign()) {
      setJobs(defaultJobs);
      return;
    }

    const _jobs: Job[] = [];
    if (country.languages.ff.length > 0) {
      _jobs.push(...defaultJobs.filter((j) => j.group === "ff"));
    }
    if (country.languages.fsm.length > 0) {
      _jobs.push(...defaultJobs.filter((j) => j.group === "fsm"));
    }
    setJobs(_jobs);
  };

  const selectChannel = (channelName: string) => {
    setSelectedJobId(null);
    setQuizLanguageCode(null);

    if (channelName === "input_directly") {
      setChannelInput(true);
      setSelectedChannel(null);

      // setSelectedJobId(jobs[0].value);

      return;
    }

    setChannelName(null);
    setChannelInput(false);
    const channel = channels?.find((c: Channel) => c.name === channelName);
    if (!channel) {
      assert(false, "Channel not found. Please select a valid channel.");
      return;
    }
    setSelectedChannel(channel);
    setSelectedChannelSegmentId(channel.channelSegmentId);
  };

  const selectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = jobs.find((j) => j.value === jobId);

    console.log("languageCode", languageCode);
    if (oldCampaign() && languageCode) {
      setQuizLanguageCode(languageCode);
    } else {
      const jobCode = job?.group.toLowerCase();
      if (jobCode && selectedCountry?.languages[jobCode] != null) {
        const langeuages = selectedCountry.languages[jobCode];
        setQuizLanguages(langeuages);

        console.log("langeuages", langeuages);
        if (langeuages.length === 1) {
          setQuizLanguageCode(langeuages[0].code);
        } else {
          setQuizLanguageCode(null);
        }
      }
    }
  };

  const routeQuizPage = async () => {
    if (!selectedCountry) {
      setErrorMessage(translation("required_country")); // 번역 필요
      return;
    }

    if (!selectedJobId) {
      setErrorMessage(translation("required_country")); // 번역 필요
      return;
    }

    if (!quizLanguageCode) {
      setErrorMessage(translation("required_quiz_language")); // 번역 필요
      return;
    }
    createItem({
      url: `${process.env.NEXT_PUBLIC_BASE_PATH}/api/users/${session?.user.id}/register`,
      body: {
        domainId: selectedCountry.id,
        domainCode: selectedCountry.code,
        subsidiaryId: selectedCountry.subsidiaryId,
        regionId: selectedCountry?.regionId,
        jobId: jobs.find((j) => j.value === selectedJobId)?.id,
        storeId: jobs.find((j) => j.value === selectedJobId)?.storeId,
        languageCode: quizLanguageCode,
        channelId: selectedChannel?.channelId,
        channelName: channelName?.trim(),
        channelSegmentId: selectedChannelSegmentId,
        campaignId: campaign.id,
        campaignSlug: campaign.name.toLowerCase() === "s25" ? campaign.name : campaign.slug,
      },
    });
  };

  useEffect(() => {
    if (errorCreate) {
      if (errorCreate.code === ERROR_CODES.UNAUTHORIZED) {
        router.push(`${campaignPath}/login`);
      }
      setErrorMessage(errorCreate.message);
    }
  }, [errorCreate]);

  const isDisabled = () => {
    if (oldCampaign()) {
      return (
        loadingCreate ||
        !selectedCountry ||
        (!selectedChannel && (!channelName || channelName.trim().length < 2)) ||
        !selectedJobId ||
        !quizLanguageCode ||
        (!loadingCreate && !!campaignPath) ||
        checkRegisteredLoading
      );
    }

    return (
      loadingCreate ||
      !selectedCountry ||
      (!selectedChannel && (!channelName || channelName.trim().length < 2)) ||
      !selectedJobId ||
      !quizLanguageCode ||
      (!loadingCreate && !!campaignPath) ||
      checkRegisteredLoading
    );
  };

  return (
    <>
      <div
        className="py-[20px] min-h-svh flex items-center justify-center"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/common/images/main_bg2.jpg')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
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
          {/* combobox */}
          <div
            className={cn(
              "flex flex-col w-full gap-[14px] font-one font-medium",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95",
              "data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
              "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
            )}
          >
            {/* countries */}
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
            {/* channel */}
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
            {/* job group */}
            <Select onValueChange={(value) => selectJob(value)} value={selectedJobId || ""}>
              <SelectTrigger
                disabled={loading || loadingCreate || (selectedChannel === null && (channelName === null || channelName.trim().length < 1))}
              >
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
            {quizLanguages && quizLanguages.length > 0 && (
              <Select onValueChange={(value) => setQuizLanguageCode(value)} value={quizLanguageCode || ""}>
                <SelectTrigger
                  disabled={
                    loading ||
                    loadingCreate ||
                    (selectedChannel === null && (channelName === null || channelName.trim().length < 1)) ||
                    !selectedJobId
                  }
                >
                  {/* <SelectValue placeholder={translation("job_group")} /> */}
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
          </div>

          <LoginButton disabled={isDisabled()} isArabic={isArabic} translationLogin={translation("save")} onClick={handleClickLoginButton} />
        </div>
        {isPolicyAcceptCountry && openSheet && (
          <PolicyRenderer
            view="sheet"
            onClick={routeQuizPage}
            loading={loading}
            open={openSheet}
            setOpenSheet={setOpenSheet}
            domainCode={selectedCountry?.code}
          />
        )}

        <ResultAlertDialog
          open={!!errorMessage}
          description={errorMessage ?? null}
          onConfirm={() => {
            setErrorMessage(null);
          }}
          translationOk={translation("ok")}
        />

        {(checkRegisteredLoading || status === "loading") && <Spinner />}
      </div>
    </>
  );
}
