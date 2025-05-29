import assert from "assert";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { ERROR_CODES } from "@/constants/error-codes";
import { defaultJobs } from "@/core/config/default";
import useCreateItem from "@/hooks/useCreateItem";
import { useCampaign } from "@/providers/campaignProvider";
import { fetchQuizLog } from "@/services/quizService";
import { Channel, DomainDetail, Job, QuizLanguage } from "@/types/pages/register/types";
import { getCampaignSlug } from "@/utils/utils";
import { UserQuizLog } from "@prisma/client";

export default function useGuestRegisterForm(campaignName: string) {
  const router = useRouter();
  const { data: session } = useSession();
  const { campaign } = useCampaign();
  const locale = useLocale();

  // Selected values
  const [selectedCountry, setSelectedCountry] = useState<DomainDetail | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedChannelSegmentId, setSelectedChannelSegmentId] = useState<string | null>(null);

  // Channel related
  const [channelName, setChannelName] = useState<string | null>(null);
  const [channelInput, setChannelInput] = useState(false);

  // Language related
  const [languageCode, setLanguageCode] = useState<string | undefined>(undefined);
  const [quizLanguageCode, setQuizLanguageCode] = useState<string | null>(null);

  // Options
  const [countries, setCountries] = useState<DomainDetail[]>([]);
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [jobs, setJobs] = useState<Job[]>(defaultJobs);
  const [quizLanguages, setQuizLanguages] = useState<QuizLanguage[]>([]);

  // Status
  const [loading, setLoading] = useState<boolean>(false);
  const [checkRegisteredLoading, setCheckRegisteredLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isLoading: loadingCreate, error: errorCreate, item: campaignPath, createItem } = useCreateItem<string>();

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const jsonUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/${campaignName}/jsons/channels.json`;
      const res = await fetch(jsonUrl);
      const data = await res.json();
      const sorted = data.sort((a: DomainDetail, b: DomainDetail) => a.name.localeCompare(b.name));
      setCountries(sorted.filter((c) => c.isReady));
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getMappedLocale = () => {
      if (locale === "es-419") return "es-LTN";
      return locale;
    };

    setLanguageCode(getMappedLocale());
    fetchCountries();
  }, [locale]);

  useEffect(() => {
    if (session?.user.id) {
      checkRegistered(session?.user.id);
    }
  }, [session?.user.id]);

  useEffect(() => {
    if (campaignPath) {
      router.push(`${campaignPath}/map`);
    }
  }, [campaignPath]);

  useEffect(() => {
    if (errorCreate) {
      if (errorCreate.code === ERROR_CODES.UNAUTHORIZED) {
        router.push(`${campaignPath}/login`);
      }
      setErrorMessage(errorCreate.message);
    }
  }, [errorCreate]);

  const checkRegistered = async (userId: string) => {
    try {
      setCheckRegisteredLoading(true);
      const quizLogResponse = await fetchQuizLog(userId, getCampaignSlug(campaign));
      const quizLog: UserQuizLog | null = quizLogResponse.item?.quizLog || null;

      if (quizLog) {
        router.push(`${quizLog.quizSetPath}/map`);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setCheckRegisteredLoading(false);
    }
  };

  const oldCampaign = (): boolean => {
    return campaignName.toLowerCase() === "s25";
  };

  const selectCountry = (code: string) => {
    const country = countries.find((c) => c.code === code);
    if (!country) {
      assert(false, "Country not found. Please select a valid country.");
      return;
    }

    setSelectedCountry(country);
    setChannels(country.channels ?? []);
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
    if (country.languages.ff.length > 0) _jobs.push(...defaultJobs.filter((j) => j.group === "ff"));
    if (country.languages.fsm.length > 0) _jobs.push(...defaultJobs.filter((j) => j.group === "fsm"));
    setJobs(_jobs);
  };

  const selectChannel = (name: string) => {
    setSelectedJobId(null);
    setQuizLanguageCode(null);

    if (name === "input_directly") {
      setChannelInput(true);
      setSelectedChannel(null);
      return;
    }

    setChannelInput(false);
    setChannelName(null);
    const channel = channels?.find((c) => c.name === name);
    if (!channel) {
      assert(false, "Channel not found");
      return;
    }

    setSelectedChannel(channel);
    setSelectedChannelSegmentId(channel.channelSegmentId);
  };

  const selectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = jobs.find((j) => j.value === jobId);

    if (oldCampaign() && languageCode) {
      setQuizLanguageCode(languageCode);
      return;
    }

    const group = job?.group.toLowerCase();
    if (group && selectedCountry?.languages[group]) {
      const langs = selectedCountry.languages[group];
      setQuizLanguages(langs);
      if (langs.length === 1) setQuizLanguageCode(langs[0].code);
      else setQuizLanguageCode(null);
    }
  };

  const isDisabled = () => {
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

  const resetForm = () => {
    setSelectedCountry(null);
    setSelectedChannel(null);
    setChannelInput(false);
    setChannelName(null);
    setSelectedJobId(null);
    setQuizLanguageCode(null);
    setChannels(null);
    setJobs(defaultJobs);
    setQuizLanguages([]);
  };

  return {
    // States
    campaignPath,
    channelInput,
    channelName,
    channels,
    checkRegisteredLoading,
    countries,
    errorMessage,
    jobs,
    languageCode,
    loading,
    loadingCreate,
    quizLanguageCode,
    quizLanguages,
    selectedChannel,
    selectedChannelSegmentId,
    selectedCountry,
    selectedJobId,

    // Setters
    setChannelName,
    setErrorMessage,
    setQuizLanguageCode,

    // Functions
    createItem,
    fetchCountries,
    isDisabled,
    resetForm,
    selectChannel,
    selectCountry,
    selectJob,
  };
}
