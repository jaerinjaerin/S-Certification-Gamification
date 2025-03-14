import { FormLabel } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils/utils';
import { ControllerRenderProps } from 'react-hook-form';
import { FormValues } from '../_type/formSchema';
import { SelectProps } from '@radix-ui/react-select';

const CustomFormLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <FormLabel className="text-secondary font-normal">{children}</FormLabel>
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
};
