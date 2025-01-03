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

interface Job {
  name: string;
  id: string;
}

interface Channel {
  name: string;
  job: Job;
  channelId: string;
  channelSegmentId: string;
}

interface DomainDetail {
  id: string;
  channels: Channel[];
  name: string;
  code: string;
  regionId: string;
  subsidaryId: string;
}

export default function GuestRegisterPage() {
  const { routeToPage } = usePathNavigator();

  const { data: session } = useSession();
  const translation = useTranslations();

  // state
  const [selectedCountry, setSelectedCountry] = useState<DomainDetail | null>(
    null
  );
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [selectedChannelSegmentId, setSelectedChannelSegmentId] = useState<
    string | null
  >(null);
  const [channelInput, setChannelInput] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [languageCode, setLanguageCode] = useState<string | undefined>(
    undefined
  ); // 브라우저에서 주는 언어코드

  // select box options
  const [countries, setCountries] = useState<DomainDetail[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [jobs] = useState<Job[]>([
    { name: "FSM", id: "8" },
    { name: "FF", id: "9" },
    // { name: "Customer Services", id: "10" },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingRegisterd, setCheckingRegisterd] = useState<boolean>(true);

  console.log("checkingRegisterd", checkingRegisterd);

  const { campaign } = useCampaign();

  const fetchConutries = async () => {
    console.log("fetchConutries");
    try {
      setLoading(true);

      const jsonUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/jsons/channels_20241227.json`;
      console.log("jsonUrl", jsonUrl);
      const res = await fetch(jsonUrl, {
        method: "GET",
        // cache: "force-cache",
        cache: "no-cache",
      });

      const data = await res.json();
      console.log("data", data);
      setCountries(data as DomainDetail[]);
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
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/users/${session?.user.id}/logs/campaigns/${campaign.id}`,
        {
          method: "GET",
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
    setChannelName(null);
    setSelectedJobId(null);
  };

  const selectChannel = (channelName: string) => {
    console.log("🚧", channelName);
    if (channelName === "input_directly") {
      setChannelInput(true);
      setSelectedChannel(null);

      setSelectedJobId(jobs[0].id);

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
    setSelectedJobId(channel.job.id);

    console.log("selectedChannel", channel);
    console.log("selectedChannelSegment", channel.channelSegmentId);
    console.log("selectedJob", channel.job.id);
  };

  const selectJob = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const routeQuizPage = () => {
    if (!selectedCountry) {
      assert(false, "Please select a country.");
    }

    createItem({
      url: `${process.env.NEXT_PUBLIC_BASE_PATH}/api/users/${session?.user.id}/register`,
      body: {
        domainId: selectedCountry.id,
        domainCode: selectedCountry.code,
        subsidaryId: selectedCountry.subsidaryId,
        regionId: selectedCountry.regionId,
        jobId: selectedJobId,
        languageCode: languageCode,
        channelId: selectedChannel?.channelId,
        channelName: channelName?.trim(),
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

  return (
    <div
      className="py-[20px] min-h-svh"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/background/main_bg2.png')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translation("enter_details")}</DialogTitle>
            <DialogDescription className="text-left">
              {translation("select_inforamiton")}
              <span className="block text-[#0037FF]">
                {translation("mandatory_fields")}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-[14px]">
            {/* countries */}
            <Select
              onValueChange={(value) => {
                selectCountry(value);
              }}
              value={`${translation("country")}*`}
            >
              <SelectTrigger
                disabled={loading || loadingCreate || countries == null}
                className={cn(
                  selectedCountry !== null && "bg-[#E5E5E5] text-[#5A5A5A]"
                )}
              >
                <SelectValue>
                  {selectedCountry === null
                    ? `${translation("country")}*`
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
              onValueChange={(value) => {
                selectChannel(value);
              }}
              value={`${translation("channel")}*`}
            >
              <SelectTrigger
                disabled={loading || loadingCreate || channels.length === 0}
                className={cn(
                  selectedChannel !== null && "bg-[#E5E5E5] text-[#5A5A5A]"
                )}
              >
                <SelectValue>
                  {selectedChannel === null
                    ? `${translation("channel")}*`
                    : selectedChannel.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[220px]">
                {channels.map((channel) => (
                  <SelectItem key={channel.name} value={channel.name}>
                    {channel.name}
                  </SelectItem>
                ))}

                <SelectItem value={"input_directly"}>
                  {translation("input_directly")}
                </SelectItem>
              </SelectContent>
              {channelInput && (
                <input
                  type="text"
                  className="relative flex w-full h-[52px] cursor-default select-none items-center py-[10px] px-5 text-sm rounded-[10px] border border-input outline-none bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 placeholder:text-[#5A5A5A]"
                  placeholder={translation("input_directly")}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    setChannelName(value);
                  }}
                />
              )}
            </Select>
            {/* job group */}
            <Select
              onValueChange={(value) => selectJob(value)}
              value={selectedJobId || ""}
            >
              <SelectTrigger
                disabled={
                  loading ||
                  loadingCreate ||
                  (selectedChannel === null &&
                    (channelName === null || channelName.trim().length < 1))
                }
              >
                <SelectValue placeholder={translation("job_group")} />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant={"primary"}
              disabled={
                loadingCreate ||
                !selectedCountry ||
                (!selectedChannel &&
                  (!channelName || channelName.trim().length < 3)) ||
                !selectedJobId ||
                !languageCode ||
                (!loadingCreate && !!campaignPath)
              }
              onClick={routeQuizPage}
              className="disabled:bg-disabled"
            >
              {translation("save")}
            </Button>
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
            <AlertDialogTitle></AlertDialogTitle>
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
