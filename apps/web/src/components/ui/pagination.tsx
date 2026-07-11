"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Pagination as PaginationData } from "@/types/pagination";

const ELLIPSIS = "ellipsis" as const;

function getPageNumbers(
  current: number,
  totalPages: number,
): (number | typeof ELLIPSIS)[] {
  const delta = 1;
  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(totalPages - 1, current + delta);

  const pages: (number | typeof ELLIPSIS)[] = [1];

  if (rangeStart > 2) pages.push(ELLIPSIS);
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < totalPages - 1) pages.push(ELLIPSIS);
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

interface PaginationProps {
  pagination: PaginationData;
  pageParam?: string;
  className?: string;
}

export function Pagination({
  pagination,
  pageParam = "page",
  className,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageParam, String(targetPage));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={page <= 1}
        nativeButton={page <= 1}
        render={page > 1 ? <Link href={hrefForPage(page - 1)} /> : undefined}
      >
        <ChevronLeft />
      </Button>

      {getPageNumbers(page, totalPages).map((item, index) =>
        item === ELLIPSIS ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-8 items-center justify-center text-muted-foreground"
            aria-hidden="true"
          >
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "default" : "outline"}
            size="icon"
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            nativeButton={item === page}
            render={
              item === page ? undefined : <Link href={hrefForPage(item)} />
            }
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={page >= totalPages}
        nativeButton={page >= totalPages}
        render={
          page < totalPages ? <Link href={hrefForPage(page + 1)} /> : undefined
        }
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
