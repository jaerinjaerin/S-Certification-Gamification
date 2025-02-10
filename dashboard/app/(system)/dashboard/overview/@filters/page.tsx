'use client';
import Filters from '@/app/(system)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { useOverviewContext } from '../_provider/provider';
import { serializeJsonToQuery } from '../../_lib/search-params';

const OverviewFilterForm = () => {
  const { dispatch } = useOverviewContext();
  const onSubmit = (formData: FieldValues) => {
    dispatch({ type: 'SET_FIELD_VALUES', payload: formData });
  };

  const onDownload = (formData: FieldValues) => {
    if (formData) {
      const searchParams = serializeJsonToQuery(formData);
      const url = `/api/dashboard/overview/download?${searchParams.toString()}`;
      window.location.href = url;
    }
  };

  return <Filters onSubmit={onSubmit} onDownload={onDownload} />;
};

export default OverviewFilterForm;
