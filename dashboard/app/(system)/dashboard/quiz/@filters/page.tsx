"use client";
import Filters from "@/app/(system)/dashboard/_components/filters";
import { FieldValues } from "react-hook-form";
import { useQuizContext } from "../_provider/provider";

const QuizFilterForm = () => {
  const { dispatch } = useQuizContext();
  const onSubmit = (formData: FieldValues) => {
    dispatch({ type: "SET_FIELD_VALUES", payload: formData });
  };

  return <Filters onSubmit={onSubmit} />;
};

export default QuizFilterForm;
