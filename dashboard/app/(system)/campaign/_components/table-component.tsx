import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UseFormReturn } from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  CustomFormLabel,
  CustomSelectTrigger,
  SelectComponent,
} from './custom-form-items';
import { FormValues } from '../_type/formSchema';
import useCampaignState from '../store/campaign-state';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/utils/utils';

export default function TableComponent({
  form,
  isEditMode,
  initialData,
}: {
  form: UseFormReturn<FormValues>;
  isEditMode: boolean;
  initialData: any;
}) {
  const TableHeadData = [
    { label: 'Job Group' },
    { label: 'First Badge Stage' },
    { label: 'Second Badge Stage' },
  ];

  const TableConfig = [
    {
      label: 'FF',
      firstStage: 'ffFirstBadgeStage',
      secondStage: 'ffSecondBadgeStage',
    },
    {
      label: 'FSM',
      firstStage: 'fsmFirstBadgeStage',
      secondStage: 'fsmSecondBadgeStage',
    },
  ] as const;

  return (
    <div className="border border-zinc-200 rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {TableHeadData.map((data, index) => {
              return (
                <TableHead
                  key={index}
                  className="p-4 text-zinc-500 font-medium"
                >
                  {data.label}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody className="table-fixed">
          {TableConfig.map((data) => {
            const { label, firstStage, secondStage } = data;
            return (
              <BadgeSettingRows
                form={form}
                key={label}
                label={label}
                firstStage={firstStage}
                secondStage={secondStage}
                isEditMode={isEditMode}
                initialData={initialData}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

const TableCellClass = 'px-4 py-3 w-[17.125rem] !align-top';

const BadgeSettingRows = ({
  label,
  firstStage,
  secondStage,
  form,
  isEditMode,
  initialData,
}: {
  label: 'FF' | 'FSM';
  firstStage: 'ffFirstBadgeStage' | 'fsmFirstBadgeStage';
  secondStage: 'ffSecondBadgeStage' | 'fsmSecondBadgeStage';
  form: UseFormReturn<FormValues>;
  isEditMode: boolean;
  initialData: any;
}) => {
  const { selectedNumberOfStages } = useCampaignState();

  return (
    <TableRow>
      <TableCell className={cn(TableCellClass, '')}>{label}</TableCell>
      <TableCell className={cn(TableCellClass, '')}>
        <FormField
          control={form.control}
          name={firstStage}
          render={({ field }) => {
            return (
              <FormItem>
                <CustomFormLabel>{label}</CustomFormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value as string}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={selectedNumberOfStages === undefined}
                  >
                    <CustomSelectTrigger
                      className={cn(
                        'max-w-[7.125rem]',
                        form.formState.errors[firstStage]?.message &&
                          'border-destructive'
                      )}
                    >
                      <SelectValue
                        placeholder={
                          isEditMode
                            ? initialData[firstStage]
                              ? initialData[firstStage]
                              : 'Select'
                            : 'Select'
                        }
                      />
                    </CustomSelectTrigger>
                    <SelectContent>
                      {Array.from({
                        length: Number(selectedNumberOfStages) + 1,
                      }).map((_, index) => {
                        return (
                          <SelectItem value={`${index}`} key={index}>
                            {index + 1}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </TableCell>
      <TableCell className={cn(TableCellClass, '')}>
        <FormField
          control={form.control}
          name={secondStage}
          render={({ field }) => (
            <FormItem>
              <CustomFormLabel>{label}</CustomFormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value as string}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  disabled={selectedNumberOfStages === undefined}
                >
                  <CustomSelectTrigger className={'max-w-[7.125rem]'}>
                    <SelectValue
                      placeholder={
                        isEditMode
                          ? initialData[secondStage]
                            ? initialData[secondStage]
                            : 'Select'
                          : 'Select'
                      }
                    />
                  </CustomSelectTrigger>
                  <SelectContent>
                    {Array.from({
                      length: Number(selectedNumberOfStages) + 1,
                    }).map((_, index) => (
                      <SelectItem value={`${index}`} key={index}>
                        {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
    </TableRow>
  );
};
