"use client";
import { Button } from "@/app/components/ui/button";
import useCreateItem from "@/app/hooks/useCreateItem";
import { getUserLocale } from "@/app/services/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { cn } from "@/lib/utils";
import { useCampaign } from "@/providers/campaignProvider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { UserQuizLog } from "@prisma/client";
import assert from "assert";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// interface ChannelSegment {
//   name: string;
//   id: string;
// }

interface Job {
  name: string;
  id: string;
}

interface Channel {
  name: string;
  job: Job;
  channelSegmentId: string;
}

interface Country {
  channels: Channel[];
  name: string;
  code: string;
  regionId: string;
  subsidaryId: string;
}

export default function GuestRegisterPage() {
  const { routeToPage } = usePathNavigator();

  const { data: session } = useSession();

  // state
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedChannelSegmentId, setSelectedChannelSegmentId] = useState<
    string | null
  >(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [languageCode, setLanguageCode] = useState<string | undefined>(
    undefined
  ); // 브라우저에서 주는 언어코드

  // select box options
  const [countries, setCountries] = useState<Country[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingRegisterd, setCheckingRegisterd] = useState<boolean>(true);

  console.log("checkingRegisterd", checkingRegisterd);

  const { campaign } = useCampaign();

  // const {
  const fetchConutries = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels`,
        {
          method: "GET",
          // cache: "force-cache",
          cache: "no-cache",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch domains");
      }

      const data = await response.json();

      // const jsonUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/jsons/channels.json`;
      // console.log("jsonUrl", jsonUrl);
      // const res = await fetch(
      //   jsonUrl
      //   // `http://localhost:3000/assets/jsons/channels.json`
      // ); // 개발 중에는 localhost, 배포 시에는 배포 URL
      // const data = await res.json();
      // console.log("data", data);
      setCountries(data.items as Country[]);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguage = async () => {
    const locale = await getUserLocale();
    console.log("locale", locale);
    setLanguageCode(locale);
  };

  useEffect(() => {
    fetchConutries();
    fetchLanguage();
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      checkRegistered();
    }
  }, [session?.user.id]);

  const {
    isLoading: loadingCreate,
    error: errorCreate,
    item: campaignPath,
    createItem,
  } = useCreateItem<string>();

  useEffect(() => {
    if (campaignPath) {
      routeToPage(`${campaignPath}/map`);
    }
  }, [campaignPath, routeToPage]);

  const checkRegistered = async () => {
    try {
      setCheckingRegisterd(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user.id}/logs/campaigns/${campaign.id}`,
        {
          method: "GET",
          // cache: "force-cache",
          cache: "no-cache",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch domains");
      }

      const data = await response.json();
      console.log("data", data);
      const userQuizLog = data.item as UserQuizLog;

      if (data.item) {
        routeToPage(`${userQuizLog.quizSetPath}/map`);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setCheckingRegisterd(false);
    }
  };

  const selectCountry = (countryCode: string) => {
    const country = countries.find((d) => d.code === countryCode);
    if (!country) {
      assert(false, "Country not found. Please select a valid country.");
    }
    setSelectedCountry(country!);
    const channels = country!.channels;
    setChannels(channels ?? []);
    setSelectedChannel(null);
  };

  const selectChannel = (channelName: string) => {
    const channel = channels?.find((c: Channel) => c.name === channelName);
    if (!channel) {
      assert(false, "Channel not found. Please select a valid channel.");
      return;
    }
    setSelectedChannel(channel);
    setSelectedChannelSegmentId(channel.channelSegmentId);
    setSelectedJobId(channel.job.id);

    console.log("selectedChannel", channel);
    console.log("selectedChannelSegment", channel.channelSegmentId);
    console.log("selectedJob", channel.job.id);
  };

  const routeQuizPage = () => {
    if (!selectedCountry) {
      assert(false, "Please select a country.");
    }
    // TODO: 코드 수정 필요
    createItem({
      url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user.id}/register`,
      body: {
        domainCode: selectedCountry.code,
        subsidaryId: selectedCountry.subsidaryId,
        regionId: selectedCountry.regionId,
        jobId: selectedJobId,
        languageCode: languageCode,
        channelSegmentId: selectedChannelSegmentId,
      },
    });
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
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_BASE_PATH}/assets/bg_main.png')`,
      }}
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
                !selectedChannelSegmentId ||
                !selectedJobId ||
                !languageCode
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
