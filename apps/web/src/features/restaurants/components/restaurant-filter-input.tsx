"use client";

import { usePersistedFilter } from "@/hooks/use-persisted-filter";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  value: string;
  label: string;
};

interface RestaurantFilterInputProps {
  label: string;
  placeholder: string;
  queryKey: string;
  options: Option[];
}

export function RestaurantFilterInput({
  label,
  placeholder,
  queryKey,
  options,
}: RestaurantFilterInputProps) {
  const { value, setValue } = usePersistedFilter(
    queryKey,
    `restaurants:filter:${queryKey}`,
  );

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-500">{label}</label>

      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {(selected: string) =>
              options.find((option) => option.value === selected)?.label ??
              placeholder
            }
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All</SelectItem>

          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
