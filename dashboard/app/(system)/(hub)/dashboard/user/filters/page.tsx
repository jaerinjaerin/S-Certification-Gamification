'use client';
import Filters from '@/app/(system)/(hub)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { updateSearchParamsOnUrl } from '@/lib/url';
import { endOfDayTime, startOfDayTime } from '@/lib/date';
import { addDays } from 'date-fns';

const UserFilterForm = () => {
  const onSubmit = (formData: FieldValues, action?: boolean) => {
    formData.date = {
      from: startOfDayTime(formData.date.from),
      to: endOfDayTime(addDays(formData.date.to, -1)),
    };
    updateSearchParamsOnUrl(formData);
  };

  return <Filters onSubmit={onSubmit} />;
};

export default UserFilterForm;

// domainPageIndex: 1,
// progressPageIndex: 1,
// usersPageIndex: 1,
