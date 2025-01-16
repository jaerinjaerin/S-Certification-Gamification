"use client";
import Filters from "@/app/(system)/dashboard/_components/filters";
import { FieldValues } from "react-hook-form";

const UserFilterForm = () => {
  const onSubmit = (formData: FieldValues) => {
    // Handle form submission
    console.log(formData);
  };

  return <Filters onSubmit={onSubmit} />;
};

export default UserFilterForm;
