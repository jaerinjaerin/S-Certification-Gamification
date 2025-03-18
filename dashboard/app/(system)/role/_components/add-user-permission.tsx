/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { LoaderWithBackground } from '@/components/loader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ChartContainer from '@/components/system/chart-container';
import { CardCustomHeaderWithoutDesc } from '@/components/system/chart-header';
import { ShowPermissionList } from './ui/select';
import { AlertInfoDialog, Delete } from '@/components/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import axios from 'axios';
import useSWR from 'swr';
import { swrFetcher } from '@/lib/fetch';

const columns: ColumnDef<UserPermission>[] = [
  {
    id: 'no',
    header: 'No',
    cell: (info) => {
      const { pageIndex, pageSize } = info.table.getState().pagination;
      return pageIndex * pageSize + info.row.index + 1; // 자동 번호 계산
    },
  },
  {
    accessorKey: 'loginName',
    header: 'User',
  },
  {
    accessorKey: 'roleName',
    header: 'Role',
    cell: ({ getValue }) => {
      const value = getValue();
      return value;
    },
  },
  {
    accessorKey: 'permissions',
    header: 'Permission',
    size: 20,
    cell: ({
      row: {
        original: { roleName },
      },
      getValue,
    }) => {
      const values = getValue() as {
        id: string;
        name: string;
        permId: string;
      }[];

      return (
        <ShowPermissionList
          placeholder="Permission List"
          roleName={roleName}
          values={values}
        />
      );
    },
  },
];

const AddUserPermission = () => {
  const [openAlert, setOpenAlert] = useState(false);
  const fallbackData = useMemo(() => ({ result: [], roles: null }), []);
  const swrKey = useMemo(() => '/api/cms/role/user-permission', []);
  const {
    data: permissionData,
    isLoading: loading,
    mutate,
  } = useSWR(swrKey, swrFetcher, { fallbackData });

  const { result: data, roles } = useMemo(
    () => permissionData,
    [permissionData]
  );

  const table = useReactTable({
    data: data || [], // 현재 페이지 데이터
    columns: [
      ...columns,
      {
        accessorKey: 'id',
        header: 'Action',
        size: 10,
        cell: ({ getValue }) => {
          const id = getValue();
          return (
            <Delete
              onDelete={async () => {
                try {
                  const response = await axios.delete(
                    '/api/cms/role/user-permission',
                    { data: { id } }
                  );
                  //   mutation
                  mutate(swrKey);
                } catch (error) {
                  console.error('Error deleting user:', error);
                }
              }}
            />
          );
        },
      },
    ], // 테이블 컬럼 정의
    getCoreRowModel: getCoreRowModel(),
  });

  const onAddRole = async (values: { loginName: string; roleId: string }) => {
    values = { ...values, loginName: values.loginName.trim() };
    try {
      const response = await axios.post(
        '/api/cms/role/user-permission',
        values
      );
      //   console.log('Add success:', response);
      //   mutation
      mutate(swrKey);
    } catch (error: any) {
      if (error.status === 400) {
        // 중복값 확인
        setOpenAlert(true);
      }
      //
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="space-y-2">
      {loading && <LoaderWithBackground />}
      <AlertInfoDialog
        open={openAlert}
        onOpenChange={setOpenAlert}
        title="Already Registered Data"
        description="The user is already registered. Please delete and re-register if you want to make changes."
      />
      <AddPermission items={roles} onSubmit={onAddRole} />
      <ChartContainer>
        <CardCustomHeaderWithoutDesc title="User Permission" />
        <div className="border rounded-md border-zinc-200">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="h-[2.5625rem]">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-medium text-center text-size-14px text-zinc-500"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const id = row.id;
                  return (
                    <TableRow key={id} className="h-[2.5625rem]">
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            className="font-medium text-center text-size-14px text-zinc-950"
                          >
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
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center"
                  >
                    {loading ? '' : 'No results.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ChartContainer>
    </div>
  );
};

export default AddUserPermission;

const schema = z.object({
  loginName: z.string().min(1, 'Login Name is required'),
  roleId: z.string().min(1, 'Role is required'),
});

type FormValues = z.infer<typeof schema>;

export const AddPermission = ({
  items,
  onSubmit,
}: {
  items: { id: string; name: string; domainName: string }[] | null;
  onSubmit: (values: { loginName: string; roleId: string }) => void;
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loginName: '',
      roleId: '',
    },
  });

  const onSubmitFormData = (values: FormValues) => {
    form.reset();
    onSubmit(values);
  };

  return (
    <ChartContainer>
      <CardCustomHeaderWithoutDesc title="Add Permission" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitFormData)} className="mb-4">
          <div className="flex items-center space-x-2">
            {/* Login Name Field */}
            <FormField
              control={form.control}
              name="loginName"
              render={({ field }) => (
                <FormItem className="w-full relative">
                  <FormControl>
                    <Input {...field} placeholder="Login Name" />
                  </FormControl>
                  <FormMessage className="absolute top-8 left-2" />
                </FormItem>
              )}
            />

            {/* Role Select Field */}
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem className="w-full relative">
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      {items && (
                        <SelectContent>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {`${item.name} (${item.domainName})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      )}
                    </Select>
                  </FormControl>
                  <FormMessage className="absolute top-8 left-2" />
                </FormItem>
              )}
            />
            <Button type="submit">Add User Permission</Button>
          </div>
        </form>
      </Form>
    </ChartContainer>
  );
};
