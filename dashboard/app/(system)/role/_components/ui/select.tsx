import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ShowPermissionList = ({
  placeholder,
  roleName,
  values,
}: {
  placeholder?: string;
  roleName: string;
  values: Permission[];
}) => {
  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder || roleName} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{roleName}</SelectLabel>
          {values.map((value) => (
            <SelectItem disabled={true} key={value.permId} value={value.permId}>
              {`▸ ${value.name}`}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
