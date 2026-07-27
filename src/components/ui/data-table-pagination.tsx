"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const totalRows = table.getFilteredRowModel().rows.length;

  if (pageCount <= 1) {
    return (
      <p className="px-1 text-sm text-gray-500">
        {totalRows} {totalRows === 1 ? "result" : "results"}
      </p>
    );
  }

  const pageNumbers = getPageNumbers(pageIndex, pageCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <p className="text-sm text-gray-500">
        Page {pageIndex + 1} of {pageCount} · {totalRows} total
      </p>
      <div className="flex items-center gap-1">
        <NavButton
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          label="First"
        >
          <ChevronsLeft size={16} />
        </NavButton>
        <NavButton
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          label="Previous"
        >
          <ChevronLeft size={16} />
        </NavButton>

        {pageNumbers.map((page, i) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => table.setPageIndex(page)}
              aria-current={page === pageIndex ? "page" : undefined}
              className={cn(
                "min-w-[2rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                page === pageIndex
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              {page + 1}
            </button>
          ),
        )}

        <NavButton onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} label="Next">
          <ChevronRight size={16} />
        </NavButton>
        <NavButton
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          label="Last"
        >
          <ChevronsRight size={16} />
        </NavButton>
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}

function getPageNumbers(pageIndex: number, pageCount: number): (number | "ellipsis")[] {
  const siblingCount = 1;
  const totalVisible = siblingCount * 2 + 5;

  if (pageCount <= totalVisible) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }

  const left = Math.max(pageIndex - siblingCount, 1);
  const right = Math.min(pageIndex + siblingCount, pageCount - 2);

  const pages: (number | "ellipsis")[] = [0];
  if (left > 1) pages.push("ellipsis");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < pageCount - 2) pages.push("ellipsis");
  pages.push(pageCount - 1);

  return pages;
}
