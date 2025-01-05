"use client";
import { FilterState } from "@/app/playground/overview/page";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface Region {
  domainId: string;
  domainName: string;
}

interface Subsidiary {
  domainId: string;
  domainName: string;
}

interface Domain {
  domainId: string;
  domainName: string;
}

interface ChannelSegment {
  id: string;
  name: string;
}

interface Job {
  id: string;
  name: string;
}

interface Language {
  code: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
}

interface FilterComponentProps {
  filters: FilterState;
  onFiltersChange: (updatedFilters: FilterState) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [channelSegments, setChannelSegments] = useState<ChannelSegment[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  // Local state for filter values
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          groupedDomains,
          channelSegmentsData,
          jobsData,
          languagesData,
          storesData,
        ] = await Promise.all([
          axios.get("/jsons/grouped_domains.json"),
          axios.get("/jsons/channel_segments.json"),
          axios.get("/jsons/jobs.json"),
          axios.get("/jsons/languages.json"),
          axios.get("/jsons/stores.json"),
        ]);

        setRegions(groupedDomains.data.regions);
        setSubsidiaries(groupedDomains.data.subsidaries);
        setDomains(groupedDomains.data.domains);
        setChannelSegments(channelSegmentsData.data);
        setJobs(jobsData.data);
        setLanguages(languagesData.data);
        setStores(storesData.data);
      } catch (error) {
        console.error("Error loading filter data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (filterName: keyof FilterState, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleDateChange = (key: "start" | "end", value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value,
      },
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  return (
    <div>
      <h2>Filters</h2>
      <h3>Galaxy AI(S24) Expert</h3>

      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium">Start Date:</label>
        <input
          type="date"
          value={localFilters.dateRange.start}
          onChange={(e) => handleDateChange("start", e.target.value)}
          className="p-2 border rounded-lg"
        />
        <label className="text-sm font-medium">End Date:</label>
        <input
          type="date"
          value={localFilters.dateRange.end}
          onChange={(e) => handleDateChange("end", e.target.value)}
          className="p-2 border rounded-lg"
        />
      </div>

      <select
        value={localFilters.regionId}
        onChange={(e) => handleFilterChange("regionId", e.target.value)}
      >
        <option value="">Select Region</option>
        {regions.map((region) => (
          <option key={region.domainId} value={region.domainId}>
            {region.domainName}
          </option>
        ))}
      </select>

      <select
        value={localFilters.subsidiaryId}
        onChange={(e) => handleFilterChange("subsidiaryId", e.target.value)}
      >
        <option value="">Select Subsidiary</option>
        {subsidiaries.map((subsidiary) => (
          <option key={subsidiary.domainId} value={subsidiary.domainId}>
            {subsidiary.domainName}
          </option>
        ))}
      </select>

      <select
        value={localFilters.domainId}
        onChange={(e) => handleFilterChange("domainId", e.target.value)}
      >
        <option value="">Select Domain</option>
        {domains.map((domain) => (
          <option key={domain.domainId} value={domain.domainId}>
            {domain.domainName}
          </option>
        ))}
      </select>

      <select
        value={localFilters.channelSegmentId}
        onChange={(e) => handleFilterChange("channelSegmentId", e.target.value)}
      >
        <option value="">Select Channel Segment</option>
        {channelSegments.map((segment) => (
          <option key={segment.id} value={segment.id}>
            {segment.name}
          </option>
        ))}
      </select>

      <select
        value={localFilters.languageId}
        onChange={(e) => handleFilterChange("languageId", e.target.value)}
      >
        <option value="">Select Language</option>
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>

      <select
        value={localFilters.jobId}
        onChange={(e) => handleFilterChange("jobId", e.target.value)}
      >
        <option value="">Select Job</option>
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>
            {job.name}
          </option>
        ))}
      </select>

      <select
        value={localFilters.storeId}
        onChange={(e) => handleFilterChange("storeId", e.target.value)}
      >
        <option value="">Select Store</option>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleApplyFilters}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default FilterComponent;
