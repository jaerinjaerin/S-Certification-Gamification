"use client";

import useCreateItem from "@/app/hooks/useCreateItem";
import useGetItemList from "@/app/hooks/useGetItemList";
import { ChannelSegmentEx, DomainEx, SalesFormatEx } from "@/app/types/type";
import { usePathNavigator } from "@/route/usePathNavigator";
import { Language, SalesFormat } from "@prisma/client";
import { useEffect, useState } from "react";

export default function GuestRegisterPage() {
  const { routeToPage } = usePathNavigator();

  // state
  const [selectedDomain, setSelectedDomain] = useState<DomainEx | null>(null);
  const [selectedChannel, setSelectedChannel] =
    useState<ChannelSegmentEx | null>(null);
  const [selectedSalesFormat, setSelectedSalesFormat] =
    useState<SalesFormat | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );

  // select box options
  const [channels, setChannels] = useState<ChannelSegmentEx[]>([]);
  const [salesFormats, setSalesFormats] = useState<SalesFormatEx[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  const {
    isLoading,
    error,
    items: domains,
  } = useGetItemList<DomainEx>({ url: "/api/domains" });

  const {
    isLoading: loadingCreate,
    error: errorCreate,
    item: campaignPath,
    createItem,
  } = useCreateItem<string>();

  const fetchLanguages = async (domainId: string, jobId: string) => {
    const response = await fetch(
      `/api/campaigns/domains/${domainId}/jobs/${jobId}/languages`,
      {
        method: "GET",
        cache: "force-cache",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch domains");
    }

    const data = await response.json();
    setLanguages(data.items);
  };

  useEffect(() => {
    if (
      selectedSalesFormat &&
      selectedDomain?.id &&
      selectedSalesFormat?.jobId
    ) {
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
    const salesFormat = salesFormats!.find(
      (c: SalesFormat) => c.id === salesFormatId
    );
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

  console.info("GuestRegisterPage render", isLoading, error, domains);
  return (
    <div className="container">
      <div>
        <h2>Domain Selection</h2>
        <select
          value={selectedDomain?.id}
          onChange={(e) => {
            const domainId = e.target.value;
            selectDomain(domainId);
          }}
          disabled={isLoading || loadingCreate || domains == null}
        >
          <option value="">Select a Domain</option>
          {domains?.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </select>

        <h2>Channel Selection</h2>
        <select
          value={selectedChannel?.id}
          onChange={(e) => {
            const channelId = e.target.value;
            selectChannel(channelId);
          }}
          disabled={isLoading || loadingCreate || channels == null}
        >
          <option value="">Select a Channel</option>
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </select>

        <h2>Sales Format Selection</h2>
        <select
          value={selectedSalesFormat?.id}
          onChange={(e) => {
            const id = e.target.value;
            selectSalesFormat(id);
          }}
          disabled={
            isLoading ||
            loadingCreate ||
            channels == null ||
            salesFormats == null
          }
        >
          <option value="">Select a Sales Format</option>
          {salesFormats.map((format) => (
            <option key={format.id} value={format.id}>
              {format.storeType} ({format.job.code})
            </option>
          ))}
        </select>

        <h2>Language Selection</h2>
        <select
          value={selectedLanguage?.id}
          onChange={(e) => {
            const id = e.target.value;
            selectLanguage(id);
          }}
          disabled={
            loadingCreate ||
            channels == null ||
            salesFormats == null ||
            languages == null
          }
        >
          <option value="">Select a Language</option>
          {languages.map((format) => (
            <option key={format.id} value={format.id}>
              {format.name} ({format.id})
            </option>
          ))}
        </select>

        <br />
        <button
          onClick={() => {
            routeQuizPage();
          }}
          disabled={
            isLoading ||
            loadingCreate ||
            !selectedDomain ||
            !selectedChannel ||
            !selectedSalesFormat ||
            !selectedLanguage
          }
        >
          Start Quiz
        </button>
      </div>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
    </div>
  );
}
