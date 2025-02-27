import { ControllerRenderProps, UseFormReturn } from 'react-hook-form';
import { FormValues } from '../../create/_type/formSchema';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { CustomFormLabel } from './custom-form-items';
import { TooltipComponent } from '../tooltip-component';

interface FlexibleControllerRenderProps
  extends ControllerRenderProps<FormValues> {
  value: FormValues[keyof FormValues];
}

const FormComponent = ({
  form,
  name,
  label,
  render,
  className,
  type = 'default',
  description,
  trigger,
}: {
  form: UseFormReturn<FormValues>;
  name: keyof FormValues;
  label?: string;
  render: (field: FlexibleControllerRenderProps) => React.ReactNode;
  className?: string;
  type?: 'default' | 'tooltip';
  description?: string;
  trigger?: React.ReactNode;
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {type === 'tooltip' ? (
            <div className="flex items-center gap-[0.625rem]">
              <CustomFormLabel>{label}</CustomFormLabel>
              <TooltipComponent description={description} trigger={trigger} />
            </div>
          ) : (
            <CustomFormLabel>{label}</CustomFormLabel>
          )}

          <FormControl>{render(field)}</FormControl>
          {name === 'slug' && !form.getValues('isSlugChecked') ? (
            <FormMessage>
              {form.formState.errors.isSlugChecked?.message}
            </FormMessage>
          ) : (
            <FormMessage />
          )}
        </FormItem>
      )}
    />
  );
};

export default FormComponent;
