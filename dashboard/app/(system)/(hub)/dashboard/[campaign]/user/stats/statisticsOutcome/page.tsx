import {
  getUserAverageScore,
  getUserCompletionTime,
} from '@/app/actions/dashboard/user/action';
import UserOutcomeChild from './_children';
import { URLSearchParams } from 'url';

const UserOutcome = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  if (!(searchParams instanceof URLSearchParams)) {
    searchParams = new URLSearchParams(searchParams as any);
  }

  const [score, time] = await Promise.all([
    getUserAverageScore(searchParams),
    getUserCompletionTime(searchParams),
  ]);

  return <UserOutcomeChild data={{ score: score || [], time: time || [] }} />;
};

export default UserOutcome;
