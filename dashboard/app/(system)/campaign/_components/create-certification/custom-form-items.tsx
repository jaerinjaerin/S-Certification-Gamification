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
import { FormValues } from '../../create/_type/formSchema';
import { forwardRef } from 'react';

const CustomFormLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <FormLabel className="text-secondary font-normal">{children}</FormLabel>
  );
};

const CustomInput = forwardRef<
  HTMLInputElement,
  {
    placeholder: string;
    className?: string;
  }
>(({ placeholder, className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      className={cn(
        'border-zinc-200 shadow-none h-full max-h-10 p-3 text-size-14px',
        className
      )}
      placeholder={placeholder}
      {...props}
    />
  );
});

CustomInput.displayName = 'CustomInput';

const CustomPopover = ({
  field,
}: {
  field: ControllerRenderProps<FormValues>;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'secondary'}
          className={cn(
            'max-w-[20rem] max-h-10 w-full h-full justify-start py-3 items-center shadow-none text-left font-normal border-zinc-200',
            !field.value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon />
          {field.value ? (
            format(field.value, 'PPP')
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

const CustomSelect = ({
  field,
  children,
  selectDefaultValue,
}: {
  field: ControllerRenderProps<FormValues>;
  children: React.ReactNode;
  selectDefaultValue: string;
}) => {
  return (
    <Select onValueChange={field.onChange} defaultValue={field.value as string}>
      <CustomSelectTrigger>
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
        'shadow-none h-full max-h-10 p-3 text-zinc-500 border-zinc-200',
        className
      )}
    >
      {children}
    </SelectTrigger>
  );
};

export {
  CustomFormLabel,
  CustomInput,
  CustomSelect,
  CustomSelectTrigger,
  CustomPopover,
};
