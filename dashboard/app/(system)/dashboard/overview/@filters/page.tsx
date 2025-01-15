"use client";
import Filters from "@/app/(system)/dashboard/_components/filters";
import { FieldValues } from "react-hook-form";

const OverviewFilterForm = () => {
  const onSubmit = (formData: FieldValues) => {
    // Handle form submission
    console.log(formData);
  };

  return <Filters onSubmit={onSubmit} hasDownloadButton={true} />;
};

export default OverviewFilterForm;
