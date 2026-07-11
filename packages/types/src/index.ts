import { Cuisine, Role } from "./generated/prisma/enums";

export { Cuisine, Role };

export interface EnumOption<T extends string> {
  value: T;
  label: string;
}

function humanize(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export const CUISINE_OPTIONS: EnumOption<Cuisine>[] = Object.values(
  Cuisine,
).map((value) => ({ value, label: humanize(value) }));

const ROLE_LABELS: Record<Role, string> = {
  [Role.REVIEWER]: "Reviewer",
  [Role.OWNER]: "Restaurant owner",
};

export const ROLE_OPTIONS: EnumOption<Role>[] = Object.values(Role).map(
  (value) => ({ value, label: ROLE_LABELS[value] }),
);
