"use client";

import { usePersistedFilter } from "@/hooks/use-persisted-filter";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { value: "desc", label: "Highest rated" },
  { value: "asc", label: "Lowest rated" },
];

export function RestaurantSortSelect() {
  const { value, setValue } = usePersistedFilter("sort", "restaurants:sort");

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-500">Sort by</label>

      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="Default">
            {(selected: string) =>
              sortOptions.find((option) => option.value === selected)?.label ??
              "Default"
            }
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Default</SelectItem>

          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
