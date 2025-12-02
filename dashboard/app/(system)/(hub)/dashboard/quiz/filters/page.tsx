/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { updateSearchParamsOnUrl } from '@/lib/url';
import { endOfDay, startOfDay } from 'date-fns';

const QuizFilterForm = () => {
  const onSubmit = (formData: FieldValues, action?: boolean) => {
    formData.date = {
      from: startOfDay(formData.date.from),
      to: endOfDay(formData.date.to),
    };
    updateSearchParamsOnUrl(formData);
  };

  return <Filters onSubmit={onSubmit} />;
};

export default QuizFilterForm;
