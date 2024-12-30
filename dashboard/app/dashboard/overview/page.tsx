"use client";

import ExpertsSummary from "@/app/dashboard/overview/components/experts-summary";
import GoalProgressChart from "@/app/dashboard/overview/components/goal-progress-chart";
import ParticipantsVsExperts from "@/app/dashboard/overview/components/participants_experts";
import StatisticsTable from "@/app/dashboard/overview/components/statistics_table";
import FilterBar from "@/components/filter_bar";
import React, { useState } from "react";

export interface FilterState {
  campaignId: string;
  regionId: string;
  subsidiaryId: string;
  domainId: string;
  channelSegmentId: string;
  languageId: string;
  jobId: string;
  storeId: string;
  dateRange: { start: string | undefined; end: string | undefined };
}

// Helper function to calculate default date range
const getDefaultDateRange = () => {
  const today = new Date("2025-01-01");
  const oneMonthLater = new Date();
  oneMonthLater.setFullYear(today.getFullYear());
  oneMonthLater.setMonth(today.getMonth() + 1);
  console.log(today.toISOString(), oneMonthLater.toISOString());

  return {
    start: today.toISOString().split("T")[0], // "YYYY-MM-DD"
    end: oneMonthLater.toISOString().split("T")[0], // "YYYY-MM-DD"
  };
};

const initialFilters: FilterState = {
  campaignId: "s24",
  regionId: "",
  subsidiaryId: "",
  domainId: "",
  channelSegmentId: "",
  languageId: "",
  jobId: "",
  storeId: "",
  dateRange: getDefaultDateRange(),
};

const DashboardOverView: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      <StatisticsTable filters={filters} />
      <GoalProgressChart campaignId="s24" />
      <ParticipantsVsExperts filters={filters} />
      <ExpertsSummary filters={filters} />
    </div>
  );
};

export default DashboardOverView;
