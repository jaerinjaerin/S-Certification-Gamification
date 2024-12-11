"use client";

import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import useCreateItem from "@/app/hooks/useCreateItem";
import { usePathNavigator } from "@/route/usePathNavigator";
import { Language } from "@prisma/client";
import assert from "assert";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

  // const fetchLanguage = async () => {
  //   const headersList = await headers();
  //   const acceptLanguage = headersList.get("accept-language");
  //   const acceptLanguageArray = acceptLanguage?.split(",");

  //   acceptLanguageArray?.map((language) => {
  //     const [langCode, weight] = language?.split(";");
  //   });

  //   console.log("acceptLanguage", acceptLanguage);
  // };

  useEffect(() => {
    fetchConutries();
    // fetchLanguage();
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
    // setSalesFormats([]);
    setLanguages([]);
    setSelectedChannel(null);
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
  const t = useTranslations("register");

  // console.info("GuestRegisterPage render", isLoading, error, domains);

  return (
    <div
      className="py-[20px] h-full bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url('/assets/bg_main1.png')` }}
    >
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("enter details")}</DialogTitle>
            <DialogDescription>{t("select information")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-[14px]">
            {/* domains */}
            <Select>
              <SelectTrigger
                disabled={loading || loadingCreate || countries == null}
                value={selectedCountry}
              >
                <SelectValue placeholder={t("country")} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((domain) => (
                  <SelectItem
                    key={domain.code}
                    value={domain.name}
                    dataValue={domain.code}
                    onChange={(e) => {
                      const target = e.target as HTMLElement; // DOM 노드로 캐스팅
                      const countryCode = target.dataset.value; // data-value 값 가져오기
                      selectCountry(countryCode!);
                    }}
                  >
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* channel */}
            <Select>
              <SelectTrigger
                disabled={loading || loadingCreate || channels.length === 0}
                value={selectedChannel}
              >
                <SelectValue placeholder={t("channel")} />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem
                    key={channel.name}
                    dataValue={channel.name}
                    value={channel.name}
                    onChange={(e) => {
                      const target = e.target as HTMLElement;
                      const channelId = target.dataset.value;
                      console.log(channelId);
                      selectChannel(channelId!);
                    }}
                  >
                    {channel.name}
                  </SelectItem>
                ))}
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
                  <SelectItem
                    key={format.id}
                    dataValue={format.id}
                    value={`${format.storeType} (${format.job.code})`}
                    onChange={(e) => {
                      const target = e.target as HTMLElement;
                      const id = target.dataset.value;
                      selectSalesFormat(id!);
                    }}
                  >
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
                <SelectValue placeholder={t("language")} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem
                    key={lang.id}
                    dataValue={lang.id}
                    value={`${lang.name} (${lang.id})`}
                    onChange={(e) => {
                      const target = e.target as HTMLElement;
                      const id = target.dataset.value;
                      selectLanguage(id!);
                    }}
                  >
                    {lang.name} ({lang.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>
          <DialogFooter close={false}>
            <Button
              variant={"primary"}
              disabled={
                // isLoading ||
                loadingCreate ||
                !selectedCountry ||
                !selectedChannel ||
                !setSelectedChannelSegment ||
                !selectedJob
              }
              onClick={routeQuizPage}
            >
              {loadingCreate ? `${t("saving")}` : `${t("save")}`}
            </Button>
            {/* {errorMessage && <p className="errorMessage">{errorMessage}</p>} */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
