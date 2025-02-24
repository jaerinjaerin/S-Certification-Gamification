import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../../formSchema';
import { SelectContent, SelectItem } from '@/components/ui/select';
import { CustomSelect } from './custom-form-items';
import FormComponent from './form-component';

export default function TableComponent({
  form,
}: {
  form: UseFormReturn<FormValues>;
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
        <TableBody>
          {TableConfig.map((data) => {
            const { label, firstStage, secondStage } = data;
            return (
              <BadgeSettingRows
                form={form}
                key={label}
                label={label}
                firstStage={firstStage}
                secondStage={secondStage}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

const BadgeSettingRows = ({
  label,
  firstStage,
  secondStage,
  form,
}: {
  label: 'FF' | 'FSM';
  firstStage: 'ffFirstBadgeStage' | 'fsmFirstBadgeStage';
  secondStage: 'ffSecondBadgeStage' | 'fsmSecondBadgeStage';
  form: UseFormReturn<FormValues>;
}) => {
  return (
    <TableRow>
      <CustomTableCell>{label}</CustomTableCell>
      <CustomTableCell>
        <FormComponent
          form={form}
          name={firstStage}
          className="max-w-[7.125rem]"
          render={(field) => (
            <CustomSelect field={field} selectDefaultValue="Select">
              <SelectContent>
                {Array.from({ length: 10 }).map((_, index) => (
                  <SelectItem value={`${index}`} key={index}>
                    {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </CustomSelect>
          )}
        />
      </CustomTableCell>
      <CustomTableCell>
        <FormComponent
          form={form}
          name={secondStage}
          className="max-w-[7.125rem]"
          render={(field) => (
            <CustomSelect field={field} selectDefaultValue="Select">
              <SelectContent>
                {Array.from({ length: 10 }).map((_, index) => (
                  <SelectItem value={`${index}`} key={index}>
                    {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </CustomSelect>
          )}
        />
      </CustomTableCell>
    </TableRow>
  );
};

const CustomTableCell = ({ children }: { children: React.ReactNode }) => {
  return <TableCell className="px-4 py-3">{children}</TableCell>;
};
