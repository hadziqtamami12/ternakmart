// OrderTrackingPage.jsx - Gojek-Style Livestock Live Tracking Map with Feeding Checkpoints
import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  ArrowLeft,
  RefreshCw,
  Info,
  CheckCircle2,
  MessageCircle,
  Store
} from 'lucide-react';
import { api } from '../utils/api';
import LiveTrackingMap from '../components/map/LiveTrackingMap';
import { TrackingMapSkeleton } from '../components/common/Skeletons';
import { useTimezone } from '../context/TimezoneContext';
import { useAppConfig } from '../context/AppConfigContext';

export default function OrderTrackingPage({ orderId, onBack, onNavigate, onStartChat }) {
  const { setDocumentTitle } = useAppConfig();
  const { formatTime } = useTimezone();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setDocumentTitle('Live Tracking Armada');
    fetchTrackingData();

    // Live polling for truck position every 8 seconds
    const interval = setInterval(() => {
      fetchTrackingData(false);
    }, 8000);

    return () => clearInterval(interval);
  }, [orderId]);

  const fetchTrackingData = async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    else setRefreshing(true);

    try {
      const targetId = orderId || 'ord_demo_001';
      const res = await api.get(`/orders/${targetId}`);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.warn('Fetch tracking error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <TrackingMapSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-theme-muted text-sm">Data pelacakan pesanan tidak ditemukan.</p>
        <button onClick={onBack} className="px-4 py-2 bg-theme-primary text-white text-xs font-bold rounded-xl">
          Kembali
        </button>
      </div>
    );
  }

  // Determine latest courier GPS coordinate from trackingLogs
  const trackingLogs = order.trackingLogs || [];
  const latestLog = trackingLogs.length > 0 ? trackingLogs[0] : null;

  const courierPos = latestLog ? {
    lat: latestLog.latitude,
    lng: latestLog.longitude,
    driverName: order.courier?.name || 'Driver Logistik Ternak',
    vehiclePlate: order.tracking_number
  } : (order.courier ? {
    lat: order.dest_lat + 0.05,
    lng: order.dest_lng - 0.04,
    driverName: order.courier.name,
    vehiclePlate: order.tracking_number
  } : null);

  const origin = order.store ? {
    lat: order.store.latitude,
    lng: order.store.longitude,
    name: order.store.store_name
  } : { lat: -6.6895, lng: 106.7869, name: 'Kandang Asal' };

  const destination = {
    lat: order.dest_lat,
    lng: order.dest_lng,
    name: order.delivery_address
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-32">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-theme-border pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Pesanan
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTrackingData(false)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-theme-card border border-theme-border text-theme-text hover:bg-theme-bg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-theme-primary ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-[11px] hidden sm:inline">Perbarui GPS</span>
          </button>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-extrabold">
            Status: {order.status}
          </span>
        </div>
      </div>

      {/* Main Grid: Leaflet Map + Driver/Logs Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Interactive Leaflet Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-theme-card border border-theme-border rounded-3xl p-2 shadow-sm">
            <LiveTrackingMap
              origin={origin}
              destination={destination}
              courierPos={courierPos}
              checkpoints={trackingLogs}
              height="460px"
            />
          </div>

          {/* Quick Animal & Route Strip */}
          <div className="p-4 rounded-2xl bg-theme-card border border-theme-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐂</span>
              <div>
                <strong className="text-theme-text block">{order.animal?.title || 'Hewan Ternak'}</strong>
                <span className="text-theme-muted text-[11px]">Resi Khusus: {order.tracking_number}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-600 font-bold block">✓ Kondisi Sehat & Bugar</span>
              <span className="text-theme-muted text-[11px]">Sirkulasi Udara Truk Aktif</span>
            </div>
          </div>
        </div>

        {/* Right Column: Driver Info & Timeline Checkpoint Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Driver & Armada Profile Card */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">Driver Armada Ternak</span>
              <span className="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {order.logistics_type === 'OFFICIAL_COURIER' ? 'Armada Resmi' : 'Kurir Peternak'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={order.courier?.avatar_url || 'https://images.unsplash.com/photo-1561495376-dc9c7c5b8726?w=200&auto=format&fit=crop&q=80'}
                alt="Driver"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-theme-primary/40 shadow-sm"
              />
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-theme-text">
                  {order.courier?.name || 'Bambang Sudiro'}
                </h3>
                <p className="text-xs text-theme-muted font-mono">Truk Kargo Khusus Hewan</p>
                <p className="text-xs font-bold text-theme-primary">
                  {order.courier?.phone_number || '+6287899887766'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/${(order.courier?.phone_number || '+6287899887766').replace(/\+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Hubungi Driver via WhatsApp
              </a>

              <button
                type="button"
                onClick={() => {
                  if (onStartChat) {
                    onStartChat(order.store?.user_id || 'usr_seller_001', order.animal);
                  } else if (onNavigate) {
                    onNavigate('chat');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-theme-primary/10 hover:bg-theme-primary/20 border border-theme-primary/30 text-theme-primary font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat Penjual ({order.store?.store_name || 'Peternak'})
              </button>
            </div>
          </div>

          {/* Rest-Stop Checkpoints & Real-time Timeline */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-theme-text uppercase tracking-wider flex items-center gap-2 border-b border-theme-border pb-3">
              <Clock className="w-4 h-4 text-theme-primary" /> Riwayat Perjalanan & Checkpoint Pakan
            </h3>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {trackingLogs.length === 0 ? (
                <p className="text-xs text-theme-muted text-center py-6">
                  Armada sedang bersiap di kandang asal.
                </p>
              ) : (
                trackingLogs.map((log, idx) => (
                  <div key={log.id || idx} className="flex items-start gap-3 text-xs relative">
                    {/* Icon indicator */}
                    <div className="mt-0.5 flex-shrink-0">
                      {log.is_rest_stop ? (
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xs ring-2 ring-amber-500/30">
                          🌿
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Log Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className={`font-bold block text-xs ${log.is_rest_stop ? 'text-amber-600 dark:text-amber-400' : 'text-theme-text'}`}>
                          {log.status_label}
                        </strong>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-theme-muted leading-relaxed">{log.notes}</p>
                      )}
                      <span className="text-[10px] text-theme-muted font-mono block">
                        {formatTime(log.recorded_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
