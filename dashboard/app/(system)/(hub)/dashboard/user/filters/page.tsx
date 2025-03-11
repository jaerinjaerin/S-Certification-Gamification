'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { updateSearchParamsOnUrl } from '@/lib/url';

const UserFilterForm = () => {
  const onSubmit = (formData: FieldValues, action?: boolean) => {
    console.log('🚀 ~ onSubmit ~ formData:', formData);
    updateSearchParamsOnUrl(formData);
  };

  return <Filters onSubmit={onSubmit} />;
};

export default UserFilterForm;

// domainPageIndex: 1,
// progressPageIndex: 1,
// usersPageIndex: 1,
