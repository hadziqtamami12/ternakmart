// DataTable.jsx - Modern Responsive Admin DataTable Component
import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';

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

  // Reset to page 1 if filter/search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, validCurrentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl w-full max-w-full">
      {/* Top Controls: Search, Filters, Page Size & Actions */}
      <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-950/40">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          {searchKeys.length > 0 && (
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
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
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <span className="text-[11px] whitespace-nowrap">Tampil:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
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

      {/* Desktop & Tablet Table View (No Horizontal Scroll - wraps gracefully) */}
      <div className="hidden md:block w-full overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 w-12 text-center">#</th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-3.5 ${col.className || ''} ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-slate-500">
                  <div className="inline-flex items-center gap-2 text-xs font-bold">
                    <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                    <span>Memuat data tabel...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-slate-500">
                  <p className="text-xs font-semibold">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const globalRowNumber = (validCurrentPage - 1) * pageSize + rowIdx + 1;
                return (
                  <tr
                    key={row[rowKey] || rowIdx}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500 font-bold">
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
      <div className="md:hidden divide-y divide-slate-800/80">
        {loading ? (
          <div className="py-10 text-center text-slate-500 text-xs font-bold">
            <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block mr-2 align-middle"></span>
            Memuat data tabel...
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((row, rowIdx) => {
            const globalRowNumber = (validCurrentPage - 1) * pageSize + rowIdx + 1;
            return (
              <div key={row[rowKey] || rowIdx} className="p-4 space-y-2.5 bg-slate-900/50">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                  <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
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
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {col.header}:
                        </span>
                        <div className="text-slate-200">
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
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 text-[11px]">
          Menampilkan <strong className="text-white">{startIndex}</strong> - <strong className="text-white">{endIndex}</strong> dari <strong className="text-emerald-400">{totalItems}</strong> data
        </div>

        {/* Pagination Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
            title="Halaman Pertama"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={validCurrentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-3 py-1 text-slate-300 text-[11px] font-bold">
            {validCurrentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
            title="Halaman Terakhir"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
