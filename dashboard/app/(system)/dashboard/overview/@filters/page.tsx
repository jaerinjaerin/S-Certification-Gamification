'use client';
import Filters from '@/app/(system)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { useOverviewContext } from '../_provider/provider';

const OverviewFilterForm = () => {
  const { dispatch } = useOverviewContext();
  const onSubmit = (formData: FieldValues) => {
    dispatch({ type: 'SET_FIELD_VALUES', payload: formData });
  };

  return <Filters onSubmit={onSubmit} hasDownloadButton={true} />;
};

export default OverviewFilterForm;
