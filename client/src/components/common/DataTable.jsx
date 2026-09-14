// DataTable.jsx - Modern Responsive Admin DataTable Component
import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Cari data...',
  searchKeys = [], // e.g. ['title', 'invoice_number', 'buyer.name']
  filterSlot = null,
  actionsSlot = null,
  initialPageSize = 10,
  emptyMessage = 'Tidak ada data yang ditemukan.',
  rowKey = 'id'
}) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return { key: null, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Filter data based on searchKeys
  const filteredData = useMemo(() => {
    if (!search.trim() || !searchKeys.length) return data;
    const query = search.toLowerCase().trim();

    return data.filter((row) => {
      return searchKeys.some((key) => {
        // Handle nested keys like 'buyer.name'
        const parts = key.split('.');
        let val = row;
        for (const p of parts) {
          if (val && typeof val === 'object') {
            val = val[p];
          } else {
            val = undefined;
            break;
          }
        }
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, search, searchKeys]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const parts = sortConfig.key.split('.');
      let valA = a;
      let valB = b;
      for (const p of parts) {
        valA = valA?.[p];
        valB = valB?.[p];
      }
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }
      return sortConfig.direction === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortConfig]);

  // Reset to page 1 if filter/search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [search, pageSize, sortConfig]);

  // Pagination calculation
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, validCurrentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

  return (
    <div className="bg-theme-card border border-theme-border rounded-2xl overflow-hidden shadow-xl w-full max-w-full">
      {/* Top Controls: Search, Filters, Page Size & Actions */}
      <div className="p-4 border-b border-theme-border flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-theme-bg/50">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          {searchKeys.length > 0 && (
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-theme-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-theme-card border border-theme-border rounded-xl pl-9 pr-8 py-2 text-xs text-theme-text placeholder:text-theme-muted/60 focus:outline-none focus:border-theme-primary transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-theme-muted hover:text-theme-text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Custom Filters (e.g. status tabs, category pills) */}
          {filterSlot && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {filterSlot}
            </div>
          )}
        </div>

        {/* Right side: Page Size selector & Custom Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch lg:self-auto">
          <div className="flex items-center gap-1.5 text-theme-muted text-xs">
            <span className="text-[11px] whitespace-nowrap font-medium">Tampil:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-theme-card border border-theme-border rounded-lg px-2 py-1 text-xs text-theme-text focus:outline-none focus:border-theme-primary font-bold cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {actionsSlot && (
            <div className="flex items-center gap-2">
              {actionsSlot}
            </div>
          )}
        </div>
      </div>

      {/* Desktop & Tablet Table View (Smooth horizontal scroll if viewport is narrow) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-left text-xs text-theme-text border-collapse">
          <thead className="bg-theme-bg/70 text-theme-muted uppercase text-[10px] font-black tracking-wider border-b border-theme-border">
            <tr>
              <th className="py-3 px-3 w-12 text-center font-mono">#</th>
              {columns.map((col, idx) => {
                const sortKey = col.sortKey || (typeof col.accessor === 'string' ? col.accessor : null);
                const isSortable = col.sortable !== false && !!sortKey;
                const isSorted = sortConfig.key === sortKey;

                return (
                  <th
                    key={idx}
                    onClick={() => isSortable && handleSort(sortKey)}
                    className={`py-3 px-3.5 ${col.className || ''} ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${isSortable ? 'cursor-pointer select-none hover:text-theme-text transition-colors group' : ''}`}
                    style={col.width ? { width: col.width } : {}}
                    title={isSortable ? `Urutkan berdasarkan ${col.header}` : undefined}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${
                      col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                    }`}>
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="flex-shrink-0">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-theme-primary" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-theme-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-theme-muted/50 group-hover:text-theme-muted opacity-60 group-hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border/60">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-theme-muted">
                  <div className="inline-flex items-center gap-2 text-xs font-bold">
                    <span className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Memuat data tabel...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-theme-muted">
                  <p className="text-xs font-semibold">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const globalRowNumber = (validCurrentPage - 1) * pageSize + rowIdx + 1;
                return (
                  <tr
                    key={row[rowKey] || rowIdx}
                    className="hover:bg-theme-bg/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-theme-muted font-bold">
                      {globalRowNumber}
                    </td>
                    {columns.map((col, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 px-3.5 ${col.cellClassName || ''} ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(row, globalRowNumber) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Card / List View (No horizontal scroll needed!) */}
      <div className="md:hidden divide-y divide-theme-border/60">
        {loading ? (
          <div className="py-10 text-center text-theme-muted text-xs font-bold">
            <span className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin inline-block mr-2 align-middle"></span>
            Memuat data tabel...
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="py-10 text-center text-theme-muted text-xs">
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((row, rowIdx) => {
            const globalRowNumber = (validCurrentPage - 1) * pageSize + rowIdx + 1;
            return (
              <div key={row[rowKey] || rowIdx} className="p-4 space-y-2.5 bg-theme-card">
                <div className="flex items-center justify-between pb-1.5 border-b border-theme-border/60">
                  <span className="text-[10px] font-mono font-bold bg-theme-bg text-theme-muted border border-theme-border px-2 py-0.5 rounded">
                    #{globalRowNumber}
                  </span>
                  {columns.find(c => c.mobileHeaderBadge) && (
                    <div>
                      {columns.find(c => c.mobileHeaderBadge).render(row, globalRowNumber)}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  {columns
                    .filter(c => !c.mobileHidden && !c.mobileHeaderBadge)
                    .map((col, cIdx) => (
                      <div key={cIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">
                          {col.header}:
                        </span>
                        <div className="text-theme-text">
                          {col.render ? col.render(row, globalRowNumber) : row[col.accessor]}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Pagination Bar */}
      <div className="p-3.5 border-t border-theme-border bg-theme-bg/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-theme-muted text-[11px]">
          Menampilkan <strong className="text-theme-text font-extrabold">{startIndex}</strong> - <strong className="text-theme-text font-extrabold">{endIndex}</strong> dari <strong className="text-theme-primary font-black">{totalItems}</strong> data
        </div>

        {/* Pagination Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage <= 1}
            className="p-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-text hover:bg-theme-bg disabled:opacity-40 disabled:hover:bg-theme-card transition-colors cursor-pointer"
            title="Halaman Pertama"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={validCurrentPage <= 1}
            className="p-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-text hover:bg-theme-bg disabled:opacity-40 disabled:hover:bg-theme-card transition-colors cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-3 py-1 text-theme-text text-[11px] font-bold">
            {validCurrentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-text hover:bg-theme-bg disabled:opacity-40 disabled:hover:bg-theme-card transition-colors cursor-pointer"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-text hover:bg-theme-bg disabled:opacity-40 disabled:hover:bg-theme-card transition-colors cursor-pointer"
            title="Halaman Terakhir"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
