"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function usePersistedFilter(queryKey: string, storageKey: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get(queryKey) ?? "";

  useEffect(() => {
    if (searchParams.has(queryKey)) return;

    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set(queryKey, stored);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router, queryKey, storageKey]);

  function setValue(nextValue: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === "all" || nextValue === null) {
      params.delete(queryKey);
      localStorage.removeItem(storageKey);
    } else {
      params.set(queryKey, nextValue);
      localStorage.setItem(storageKey, nextValue);
    }
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return { value, setValue };
}
