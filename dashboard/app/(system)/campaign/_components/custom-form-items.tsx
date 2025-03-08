import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { ControllerRenderProps } from 'react-hook-form';
import { FormValues } from '../_type/formSchema';
import { SelectProps } from '@radix-ui/react-select';

const CustomFormLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <FormLabel className="text-secondary font-normal">{children}</FormLabel>
  );
};

const DatePickerPopover = ({
  field,
  error,
}: {
  field: ControllerRenderProps<FormValues>;
  error?: string;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'secondary'}
          className={cn(
            'max-w-[20rem] max-h-10 w-full h-full justify-start py-3 items-center shadow-none text-left font-normal ',
            !field.value && 'text-muted-foreground',
            error && 'border-destructive'
          )}
        >
          <CalendarIcon />
          {field.value ? (
            format(field.value as Date, 'PPP')
          ) : (
            <span className="font-medium">Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 "
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Calendar
          mode="single"
          selected={field.value as Date}
          onSelect={field.onChange}
        />
      </PopoverContent>
    </Popover>
  );
};

// TODO: 수정 필요
const SelectComponent = ({
  field,
  children,
  selectDefaultValue,
  disabled,
  className,
  isEditMode,
  initialData,
  ...props
}: {
  field: ControllerRenderProps<FormValues>;
  children: React.ReactNode;
  selectDefaultValue: string;
  disabled?: boolean;
  className?: string;
  isEditMode?: boolean;
  initialData?: any;
} & SelectProps) => {
  return (
    <Select
      onValueChange={field.onChange}
      defaultValue={field.value as string}
      disabled={disabled}
      {...props}
    >
      <CustomSelectTrigger className={cn('', className)}>
        <SelectValue placeholder={selectDefaultValue} />
      </CustomSelectTrigger>
      {children}
    </Select>
  );
};

const CustomSelectTrigger = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <SelectTrigger
      className={cn(
        'shadow-none h-full max-h-10 p-3 text-zinc-500 disabled:bg-zinc-200',
        className
      )}
    >
      {children}
    </SelectTrigger>
  );
};

export {
  CustomFormLabel,
  // CustomInput,
  SelectComponent,
  CustomSelectTrigger,
  DatePickerPopover,
};
