"use client";
import Filters from "@/app/(system)/dashboard/_components/filters";
import { FieldValues } from "react-hook-form";
import { useUserContext } from "../_provider/provider";

const UserFilterForm = () => {
  const { dispatch } = useUserContext();
  const onSubmit = (formData: FieldValues) => {
    dispatch({ type: "SET_FIELD_VALUES", payload: formData });
  };

  return <Filters onSubmit={onSubmit} />;
};

export default UserFilterForm;
