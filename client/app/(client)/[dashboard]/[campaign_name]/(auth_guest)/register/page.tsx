"use client";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useCreateItem from "@/app/hooks/useCreateItem";
import { usePathNavigator } from "@/route/usePathNavigator";
import { Language } from "@prisma/client";
import assert from "assert";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { getUserLocale } from "@/app/services/locale";

interface ChannelSegment {
  name: string;
  id: string;
}

interface Job {
  name: string;
  id: string;
}

interface Channel {
  name: string;
  job: Job;
  channelSegment: ChannelSegment;
}

interface Country {
  channels: Channel[];
  name: string;
  code: string;
  region: string;
  subsidary: string;
}

export default function GuestRegisterPage() {
  const { routeToPage, routeToError } = usePathNavigator();

  const { data: session } = useSession();

  // state
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedChannelSegment, setSelectedChannelSegment] =
    useState<ChannelSegment | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  // const [selectedSalesFormat, setSelectedSalesFormat] =
  //   useState<SalesFormat | null>(null);
  // const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
  //   null
  // );

  const [language, setLanguage] = useState<string | undefined>(undefined); // 브라우저에서 주는 언어코드

  // select box options
  const [countries, setCountries] = useState<Country[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  // const [salesFormats, setSalesFormats] = useState<SalesFormatEx[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  // const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // const {
  //   isLoading,
  //   error,
  //   items: domains,
  // } = useGetItemList<DomainEx>({ url: "/api/domains" });

  const fetchConutries = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        // `${process.env.API_URL}/assets/jsons/channels.json`
        `http://localhost:3000/assets/jsons/channels.json`
      ); // 개발 중에는 localhost, 배포 시에는 배포 URL
      const data = await res.json();
      console.log("data", data);
      setCountries(data as Country[]);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguage = async () => {
    const locale = await getUserLocale();
    setLanguage(locale);
  };

  useEffect(() => {
    fetchConutries();
    fetchLanguage();
  }, []);

  const {
    isLoading: loadingCreate,
    error: errorCreate,
    item: campaignPath,
    createItem,
  } = useCreateItem<string>();

  // console.log("user", session?.user);

  // if (session?.user.provider !== AuthType.GUEST) {
  //   console.log("redirect to dashboard");
  //   // routeToError("/error/not-found");
  // }

  // const fetchLanguages = async (domainId: string, jobId: string) => {
  //   const response = await fetch(`/api/campaigns/domains/${domainId}/jobs/${jobId}/languages`, {
  //     method: "GET",
  //     // cache: "force-cache",
  //     cache: "no-cache",
  //   });

  //   if (!response.ok) {
  //     const errorData = await response.json();
  //     throw new Error(errorData.message || "Failed to fetch domains");
  //   }

  //   const data = await response.json();
  //   setLanguages(data.items);
  // };

  // useEffect(() => {
  //   if (selectedSalesFormat && selectedDomain?.id && selectedSalesFormat?.jobId) {
  //     fetchLanguages(selectedDomain?.id, selectedSalesFormat?.jobId);
  //   }
  // }, [selectedSalesFormat, selectedDomain]);

  useEffect(() => {
    if (campaignPath) {
      routeToPage(`${campaignPath}/map`);
    }
  }, [campaignPath, routeToPage]);

  const selectCountry = (countryCode: string) => {
    const country = countries.find((d) => d.code === countryCode);
    if (!country) {
      assert(false, "Country not found. Please select a valid country.");
    }
    setSelectedCountry(country!);
    const channels = country!.channels;
    setChannels(channels ?? []);
    setLanguages([]);
    setSelectedChannel(null);
    // setSalesFormats([]);
    // setSelectedSalesFormat(null);
    // setSelectedLanguage(null);
  };

  const selectChannel = (channelName: string) => {
    const channel = channels?.find((c: Channel) => c.name === channelName);
    if (!channel) {
      assert(false, "Channel not found. Please select a valid channel.");
      return;
    }
    setSelectedChannel(channel);
    setSelectedChannelSegment(channel.channelSegment);
    setSelectedJob(channel.job);

    console.log("selectedChannel", channel);
    console.log("selectedChannelSegment", channel.channelSegment);
    console.log("selectedJob", channel.job);

    // const salesFormats = channel.salesFormats;
    // setSalesFormats(salesFormats ?? []);
    // setLanguages([]);

    // setSelectedSalesFormat(null);
    // setSelectedLanguage(null);
  };

  // const selectSalesFormat = (salesFormatId: string) => {
  //   const salesFormat = salesFormats!.find(
  //     (c: SalesFormat) => c.id === salesFormatId
  //   );
  //   if (!salesFormat) {
  //     alert("Sales Format not found. Please select a valid sales format.");
  //     return;
  //   }
  //   // setSelectedSalesFormat(salesFormat);

  //   // setSelectedLanguage(null);
  // };

  // const selectLanguage = (languageId: string) => {
  //   const language = languages.find((l) => l.id === languageId);
  //   if (!language) {
  //     alert("Language not found. Please select a valid language.");
  //     return;
  //   }
  //   setSelectedLanguage(language);
  // };

  const routeQuizPage = () => {
    // TODO: 코드 수정 필요
    // createItem({
    //   url: `/api/users/${session?.user.id}/register`,
    //   body: {
    //     domainCode: selectedCountry?.code,
    //     jobId: selectedJob?.id,
    //     // languageId: selectedLanguage?.id,
    //     channelSegmentId: selectedChannelSegment?.id,
    //   },
    // });
  };

  // const errorMessage = error || errorCreate;
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    if (errorCreate) {
      setErrorMessage(errorCreate);
    }
  }, [errorCreate]);
  const t = useTranslations("register");

  // console.info("GuestRegisterPage render", isLoading, error, domains);

  return (
    <div
      className="py-[20px] h-full bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url('/assets/bg_main.png')` }}
    >
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("enter details")}</DialogTitle>
            <DialogDescription className="text-left">
              {t("select information")}
              <span className="block text-[#0037FF]">*Mandatory fields</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-[14px]">
            {/* countries */}
            <Select
              defaultValue={t("country")}
              onValueChange={(value) => selectCountry(value)}
              value={t("country")}
            >
              <SelectTrigger
                disabled={loading || loadingCreate || countries == null}
                className={cn(
                  selectedCountry !== null && "bg-[#E5E5E5] text-[#5A5A5A]"
                )}
              >
                <SelectValue>
                  {selectedCountry === null
                    ? t("country")
                    : selectedCountry.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[220px]">
                {countries.map((country, idx) => (
                  <SelectItem key={idx} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* channel */}
            <Select
              onValueChange={(value) => selectChannel(value)}
              value={t("channel")}
            >
              <SelectTrigger
                disabled={loading || loadingCreate || channels.length === 0}
                className={cn(
                  selectedChannel !== null && "bg-[#E5E5E5] text-[#5A5A5A]"
                )}
              >
                <SelectValue>
                  {selectedChannel === null
                    ? t("channel")
                    : selectedChannel.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[220px]">
                {channels.map((channel) => (
                  <SelectItem key={channel.name} value={channel.name}>
                    {channel.name}
                  </SelectItem>
                ))}
                {/* TODO: 
                 1. 직접입력 클릭 시  input 컴포넌트 생성
                 2. input의 입력된 값을 channel로 전달
                */}
                {/* <SelectItem value={"직접입력할거에요"}>직접입력</SelectItem> */}
              </SelectContent>
            </Select>
            {/* job group */}
            {/* <Select>
              <SelectTrigger
                disabled={
                  isLoading ||
                  loadingCreate ||
                  channels.length === 0 ||
                  salesFormats.length === 0
                }
                value={selectedSalesFormat}
              >
                <SelectValue placeholder={t("job group")} />
              </SelectTrigger>
              <SelectContent>
                {salesFormats.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    {format.storeType} ({format.job.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            {/* language */}
            {/* <Select>
              <SelectTrigger
                disabled={
                  isLoading ||
                  loadingCreate ||
                  channels.length === 0 ||
                  salesFormats.length === 0 ||
                  languages.length === 0
                }
                value={selectedLanguage}
              >
                <SelectValue>{selectedLanguage === null ? t("language") : selectedLanguage.name}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name} ({lang.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>
          <DialogFooter>
            <Button
              variant={"primary"}
              disabled={
                // isLoading ||
                loadingCreate ||
                !selectedCountry ||
                !selectedChannel ||
                !selectedChannelSegment ||
                !selectedJob
              }
              onClick={routeQuizPage}
              className="disabled:bg-disabled"
            >
              {loadingCreate ? `${t("saving")}` : `${t("save")}`}
            </Button>
            {/* {errorMessage && <p className="errorMessage">{errorMessage}</p>} */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* error alert */}
      <AlertDialog
        open={!!errorMessage}
        onOpenChange={() => setErrorMessage(undefined)}
      >
        <AlertDialogContent className="w-[250px] sm:w-[340px] rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Alert</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button variant={"primary"} onClick={() => {}}>
                OK
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
