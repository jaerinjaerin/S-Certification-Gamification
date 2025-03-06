'use client';
import { LoaderWithBackground } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { searchParamsToQuery, swrFetcher } from '@/lib/fetch';
import { UploadedFile } from '@prisma/client';
import useSWR from 'swr';
import { columns } from './columns';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface UiLanguageDataTableProps {
  data: DataType[] | undefined;
  columns: ColumnDef<DataType>[];
}

export function UiLanguageDataTable() {
  const { campaign } = useStateVariables();
  const { data, isLoading: loading } = useSWR(
    `/api/cms/ui_language?${searchParamsToQuery({ campaignId: campaign?.id })}`,
    swrFetcher
  );

  if (loading) {
    return <LoaderWithBackground />;
  }

  if (!data.result.groupedLanguages) {
    return null;
  }

  return (
    <DataTable data={data.result.groupedLanguages} columns={columns} />
    // <>
    //   {data.result.groupedLanguages.map(
    //     (groupedData: { file: UploadedFile; language: Language }) => {
    //       console.log(groupedData);
    //       return (
    //         <DataTable data={groupedData} columns={columns} />

    //         // <>
    //         //   <div>
    //         //     {groupedData.language.name}
    //         //     {groupedData.language.code},
    //         //   </div>
    //         //   <a
    //         //     href={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${groupedData.file.path}`}
    //         //     download
    //         //     target="_self"
    //         //   >
    //         //     <button>파일 다운로드</button>
    //         //   </a>
    //         // </>
    //       );
    //     }
    //   )}
    // </>
  );
}

const DataTable = ({ data = [], columns }: UiLanguageDataTableProps) => {
  console.log(data);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => {
          return (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="p-4 text-zinc-500">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          );
        })}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id} className="px-4 py-6">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No registered UI language. Please select the Upload button to add
              one.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
