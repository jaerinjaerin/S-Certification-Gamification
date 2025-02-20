'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { useUserContext } from '../_provider/provider';
import { updateSearchParamsOnUrl } from '@/lib/url';

const UserFilterForm = () => {
  const { dispatch } = useUserContext();
  const onSubmit = (formData: FieldValues, action?: boolean) => {
    // 서치파람 업데이트
    updateSearchParamsOnUrl(
      action
        ? { ...formData, domainPageIndex: 1, progressPageIndex: 1 }
        : formData
    );
    //
    dispatch({ type: 'SET_FIELD_VALUES', payload: formData });
  };

  return <Filters onSubmit={onSubmit} />;
};

export default UserFilterForm;
