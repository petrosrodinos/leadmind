import { Pagination } from "@heroui/react";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
  isLoading?: boolean;
  label?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(2);
  pages.add(totalPages - 1);
  pages.add(totalPages);
  if (currentPage - 1 > 0) pages.add(currentPage - 1);
  pages.add(currentPage);
  if (currentPage + 1 <= totalPages) pages.add(currentPage + 1);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;

  for (const p of sorted) {
    if (p - prev > 2) {
      result.push("ellipsis");
    } else if (p - prev === 2) {
      result.push(prev + 1);
    }
    result.push(p);
    prev = p;
  }

  return result;
}

export function TablePagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  isFetching,
  isLoading,
  label = "items",
}: TablePaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <Pagination size="sm">
      <Pagination.Summary>
        {start} to {end} of {total} {label}
        {isFetching && !isLoading ? " · refreshing…" : ""}
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={page <= 1} onPress={() => onPageChange(Math.max(1, page - 1))}>
            <Pagination.PreviousIcon />
            Prev
          </Pagination.Previous>
        </Pagination.Item>
        {pageNumbers.map((p, i) =>
          p === "ellipsis" ? (
            <Pagination.Item key={`ellipsis-${i}`}>
              <span className="px-1.5 text-muted select-none">…</span>
            </Pagination.Item>
          ) : (
            <Pagination.Item key={p}>
              <Pagination.Link isActive={p === page} onPress={() => onPageChange(p)}>
                {p}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}
        <Pagination.Item>
          <Pagination.Next isDisabled={page >= totalPages} onPress={() => onPageChange(Math.min(totalPages, page + 1))}>
            Next
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
