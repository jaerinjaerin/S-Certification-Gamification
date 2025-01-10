"use client";

import FilterBar from "@/components/filter_bar";
import React, { useState } from "react";
import CategoryErrorRate from "./components/error_rate_by_category";
import IncorrectQuestions from "./components/incorrect_questions";

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
  // console.log(today.toISOString(), oneMonthLater.toISOString());

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

const DashBoardQuiz: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      <IncorrectQuestions filters={filters} />
      <CategoryErrorRate filters={filters} />
    </div>
  );
};

export default DashBoardQuiz;
