import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "./EmptyState";
export function DataTable({
  columns,
  rows,
  searchKeys,
  filters,
  actions,
  pageSize = 10,
  emptyTitle = "Nothing here yet",
  emptyDesc = "Once data flows in, it will show up here.",
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const filtered = useMemo(() => {
    let r = rows;
    if (q && searchKeys?.length) {
      const needle = q.toLowerCase();
      r = r.filter((row) =>
        searchKeys.some((k) =>
          String(row[k] ?? "")
            .toLowerCase()
            .includes(needle),
        ),
      );
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sort) {
        r = [...r].sort(col.sort);
        if (sortDir === "desc") r.reverse();
      }
    }
    return r;
  }, [q, rows, searchKeys, sortKey, sortDir, columns]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };
  return (
    <div className="rounded-2xl card-premium overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        {searchKeys && (
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="Search…"
              className="h-10 rounded-xl bg-muted/30 pl-9"
            />
          </div>
        )}
        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      </div>

      {paged.length === 0 ? (
        <div className="p-6">
          <EmptyState title={emptyTitle} description={emptyDesc} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                {columns.map((c) => (
                  <TableHead key={c.key} className={c.className}>
                    {c.sort ? (
                      <button
                        onClick={() => toggleSort(c.key)}
                        className="flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                      >
                        {c.header}
                        {sortKey === c.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-30" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        {c.header}
                      </span>
                    )}
                  </TableHead>
                ))}
                {actions && <TableHead className="w-[60px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row, i) => (
                <motion.tr
                  key={String(row.id ?? i)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-border/60 transition-colors hover:bg-muted/30"
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render(row, i)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          {actions.map((a) => (
                            <DropdownMenuItem
                              key={a.label}
                              onClick={() => a.onClick(row)}
                              className={a.danger ? "text-destructive focus:text-destructive" : ""}
                            >
                              {a.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
        <span>
          {filtered.length} rows · page {page + 1} of {pages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-lg"
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pages - 1}
            onClick={() => setPage(page + 1)}
            className="rounded-lg"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
