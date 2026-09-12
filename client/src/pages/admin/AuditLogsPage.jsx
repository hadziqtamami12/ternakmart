// AuditLogsPage.jsx - Order Audit Log Viewer powered by DataTable with UTC & Local Time
import React, { useState, useEffect } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';
import { useTimezone } from '../../context/TimezoneContext';
import { useAppConfig } from '../../context/AppConfigContext';
import DataTable from '../../components/common/DataTable';

export default function AuditLogsPage({ onBack }) {
  const { setDocumentTitle } = useAppConfig();
  const { config: tzConfig } = useTimezone();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDocumentTitle('Audit Log Pesanan');
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs');
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.warn('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS = {
    PENDING:    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    PAID:       'bg-blue-500/20 text-blue-300 border-blue-500/30',
    CONFIRMED:  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    PROCESSING: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    SHIPPED:    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    DELIVERED:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    COMPLETED:  'bg-green-500/20 text-green-400 border-green-500/30',
    CANCELLED:  'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_COLORS[status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
      {status || '-'}
    </span>
  );

  const columns = [
    {
      header: 'Waktu Lokal',
      accessor: 'recorded_at_local',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-100 text-[11px]">{row.recorded_at_local}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{row.recorded_at_utc}</div>
        </div>
      ),
    },
    {
      header: 'Invoice',
      accessor: 'invoice_number',
      render: (row) => (
        <span className="font-mono font-bold text-emerald-400 text-[11px]">{row.invoice_number || '-'}</span>
      ),
    },
    {
      header: 'Pelaku (Aktor)',
      accessor: 'actor_name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-100 text-[11px]">{row.actor_name}</div>
          <div className="text-[10px] font-bold text-emerald-400 uppercase mt-0.5">{row.actor_role}</div>
        </div>
      ),
    },
    {
      header: 'Transisi Status',
      accessor: 'from_status',
      render: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusBadge status={row.from_status} />
          <span className="text-slate-500 text-xs">→</span>
          <StatusBadge status={row.to_status} />
        </div>
      ),
    },
    {
      header: 'Catatan Audit',
      accessor: 'notes',
      render: (row) => (
        <span className="text-slate-300 text-[11px] leading-relaxed">{row.notes || '-'}</span>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      render: (row) => (
        <span className="font-mono text-[10px] text-slate-500">{row.ip_address || '127.0.0.1'}</span>
      ),
      mobileHidden: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Audit Log Transisi Status Pesanan
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Zona Waktu Aktif: <strong className="text-slate-200">{tzConfig.label}</strong> — disimpan seragam dalam UTC
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          Segarkan Log
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Cari invoice, nama aktor, status..."
        searchKeys={['invoice_number', 'actor_name', 'actor_role', 'from_status', 'to_status', 'notes', 'ip_address']}
        emptyMessage="Belum ada catatan audit log pesanan."
        initialPageSize={15}
        rowKey="id"
      />
    </div>
  );
}
