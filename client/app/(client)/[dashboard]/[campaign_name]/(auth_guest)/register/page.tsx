"use client";

import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import useCreateItem from "@/app/hooks/useCreateItem";
import useGetItemList from "@/app/hooks/useGetItemList";
import { ChannelSegmentEx, DomainEx, SalesFormatEx } from "@/app/types/type";
import { usePathNavigator } from "@/route/usePathNavigator";
import { Language, SalesFormat } from "@prisma/client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function GuestRegisterPage() {
  const { routeToPage } = usePathNavigator();

  // state
  const [selectedDomain, setSelectedDomain] = useState<DomainEx | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelSegmentEx | null>(null);
  const [selectedSalesFormat, setSelectedSalesFormat] = useState<SalesFormat | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  // select box options
  const [channels, setChannels] = useState<ChannelSegmentEx[]>([]);
  const [salesFormats, setSalesFormats] = useState<SalesFormatEx[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  const { isLoading, error, items: domains } = useGetItemList<DomainEx>({ url: "/api/domains" });

  const { isLoading: loadingCreate, error: errorCreate, item: campaignPath, createItem } = useCreateItem<string>();

  const fetchLanguages = async (domainId: string, jobId: string) => {
    const response = await fetch(`/api/campaigns/domains/${domainId}/jobs/${jobId}/languages`, {
      method: "GET",
      // cache: "force-cache",
      cache: "no-cache",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch domains");
    }

    const data = await response.json();
    setLanguages(data.items);
  };

  useEffect(() => {
    if (selectedSalesFormat && selectedDomain?.id && selectedSalesFormat?.jobId) {
      fetchLanguages(selectedDomain?.id, selectedSalesFormat?.jobId);
    }
  }, [selectedSalesFormat, selectedDomain]);

  useEffect(() => {
    if (campaignPath) {
      routeToPage(`${campaignPath}/map`);
    }
  }, [campaignPath, routeToPage]);

  const selectDomain = (domainId: string) => {
    const domain = domains.find((d) => d.id === domainId);
    setSelectedDomain(domain);

    const channels = domain?.channelSegments;
    setChannels(channels ?? []);
    setSalesFormats([]);
    setLanguages([]);

    setSelectedChannel(null);
    setSelectedSalesFormat(null);
    setSelectedLanguage(null);
  };

  const selectChannel = (channelId: string) => {
    const channel = channels?.find((c: ChannelSegmentEx) => c.id === channelId);
    if (!channel) {
      alert("Channel not found. Please select a valid channel.");
      return;
    }
    setSelectedChannel(channel);
    const salesFormats = channel.salesFormats;
    setSalesFormats(salesFormats ?? []);
    setLanguages([]);

    setSelectedSalesFormat(null);
    setSelectedLanguage(null);
  };

  const selectSalesFormat = (salesFormatId: string) => {
    const salesFormat = salesFormats!.find((c: SalesFormat) => c.id === salesFormatId);
    if (!salesFormat) {
      alert("Sales Format not found. Please select a valid sales format.");
      return;
    }
    setSelectedSalesFormat(salesFormat);

    setSelectedLanguage(null);
  };

  const selectLanguage = (languageId: string) => {
    const language = languages.find((l) => l.id === languageId);
    if (!language) {
      alert("Language not found. Please select a valid language.");
      return;
    }
    setSelectedLanguage(language);
  };

  const routeQuizPage = () => {
    createItem({
      url: `/api/campaigns/register`,
      body: {
        domainId: selectedDomain?.id,
        jobId: selectedSalesFormat?.jobId,
        languageId: selectedLanguage?.id,
        channelSegmentId: selectedChannel?.id,
        salesFormatId: selectedSalesFormat?.id,
      },
    });
  };

  const errorMessage = error || errorCreate;
  const t = useTranslations("register");

  console.info("GuestRegisterPage render", isLoading, error, domains);

  return (
    <div className="py-[20px] h-full bg-no-repeat bg-cover bg-center" style={{ backgroundImage: `url('/assets/bg_main.png')` }}>
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("enter details")}</DialogTitle>
            <DialogDescription>{t("select information")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-[14px]">
            {/* domains */}
            <Select>
              <SelectTrigger disabled={isLoading || loadingCreate || domains == null} value={selectedDomain}>
                <SelectValue placeholder={t("country")} />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem
                    key={domain.id}
                    value={domain.name}
                    dataValue={domain.id}
                    onChange={(e) => {
                      const target = e.target as HTMLElement; // DOM 노드로 캐스팅
                      const domainId = target.dataset.value; // data-value 값 가져오기
                      selectDomain(domainId!);
                    }}
                  >
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* channel */}
            <Select>
              <SelectTrigger disabled={isLoading || loadingCreate || channels.length === 0} value={selectedChannel}>
                <SelectValue placeholder={t("channel")} />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem
                    key={channel.id}
                    dataValue={channel.id}
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
            <Select>
              <SelectTrigger disabled={isLoading || loadingCreate || channels.length === 0 || salesFormats.length === 0} value={selectedSalesFormat}>
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
            </Select>
            {/* language */}
            <Select>
              <SelectTrigger
                disabled={isLoading || loadingCreate || channels.length === 0 || salesFormats.length === 0 || languages.length === 0}
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
            </Select>
          </div>
          <DialogFooter close={false}>
            <Button
              variant={"primary"}
              disabled={isLoading || loadingCreate || !selectedDomain || !selectedChannel || !selectedSalesFormat || !selectedLanguage}
              onClick={routeQuizPage}
            >
              {loadingCreate ? `${t("saving")}` : `${t("save")}`}
            </Button>
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
