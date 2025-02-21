'use client';

import { DataTable } from './data-table';
import { columns } from './columns';
import useSWR from 'swr';
import Loading from '../../loading';

// 데이터 패칭 함수 (fetcher)
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LanguageDataTable() {
  const { data, isLoading } = useSWR('/api/cms/languages', fetcher);

  if (isLoading) return <Loading />;

  return <DataTable columns={columns} data={data.result} />;
}
