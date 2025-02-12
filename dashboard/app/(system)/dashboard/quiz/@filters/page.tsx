/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Filters from '@/app/(system)/dashboard/_components/filters';
import { FieldValues } from 'react-hook-form';
import { useQuizContext } from '../_provider/provider';
import { updateSearchParamsOnUrl } from '@/lib/url';

const QuizFilterForm = () => {
  const { dispatch } = useQuizContext();
  const onSubmit = (formData: FieldValues, action?: boolean) => {
    // 서치파람 업데이트
    updateSearchParamsOnUrl(formData);
    //
    dispatch({ type: 'SET_FIELD_VALUES', payload: formData });
  };

  return <Filters onSubmit={onSubmit} />;
};

export default QuizFilterForm;
