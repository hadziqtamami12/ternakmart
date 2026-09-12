// CourierDashboardPage.jsx - Courier Fleet Management, GPS Update & Rest Stop Checkpoint Logger
import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  Navigation,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../../utils/api';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useTimezone } from '../../context/TimezoneContext';
import { useAppConfig } from '../../context/AppConfigContext';

export default function CourierDashboardPage({ onOpenTracking }) {
  const { setDocumentTitle } = useAppConfig();
  const { user } = useAuth();
  const { formatTime } = useTimezone();

  const [orders, setOrders] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fleet register modal
  const [vehicleType, setVehicleType] = useState('ENGKEL_TRUCK');
  const [plateNumber, setPlateNumber] = useState('');
  const [driverName, setDriverName] = useState(user?.name || '');
  const [driverPhone, setDriverPhone] = useState(user?.phone_number || '');
  const [isRegisteringFleet, setIsRegisteringFleet] = useState(false);

  // GPS Update & Rest-Stop Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentLat, setCurrentLat] = useState(-6.5500);
  const [currentLng, setCurrentLng] = useState(106.8100);
  const [statusLabel, setStatusLabel] = useState('Rest Stop KM 45 Tol Jagorawi');
  const [notes, setNotes] = useState('Pemberian pakan konsentrat & minum hewan.');
  const [isRestStop, setIsRestStop] = useState(true);
  const [submittingGps, setSubmittingGps] = useState(false);

  // Handover Finish Modal
  const [handoverOrder, setHandoverOrder] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [handoverPhoto, setHandoverPhoto] = useState(null);
  const [handoverPreview, setHandoverPreview] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('Ternak diterima hidup sehat.');
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    setDocumentTitle('Portal Armada Kurir');
    fetchCourierData();
  }, []);

  const fetchCourierData = async () => {
    try {
      setLoading(true);
      const [orderRes, fleetRes] = await Promise.all([
        api.get('/orders'),
        api.get('/courier/fleets')
      ]);

      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data);
      }
      if (fleetRes.success && fleetRes.data) {
        setFleets(fleetRes.data);
      }
    } catch (err) {
      console.warn('Courier fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFleet = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/courier/register-fleet', {
        vehicle_type: vehicleType,
        plate_number: plateNumber,
        driver_name: driverName,
        phone_number: driverPhone
      });

      if (res.success) {
        alert('Armada berhasil didaftarkan!');
        setIsRegisteringFleet(false);
        fetchCourierData();
      }
    } catch (err) {
      alert(err.message || 'Gagal mendaftarkan armada.');
    }
  };

  const handleAcceptDelivery = async (orderId) => {
    try {
      const res = await api.post('/courier/accept', { order_id: orderId });
      if (res.success) {
        alert('Tugas pengantaran armada berhasil diterima!');
        fetchCourierData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menerima penugasan.');
    }
  };

  const handleSendGpsUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmittingGps(true);
    try {
      const res = await api.post('/courier/tracking-gps', {
        order_id: selectedOrder.id,
        latitude: currentLat,
        longitude: currentLng,
        status_label: statusLabel,
        notes,
        is_rest_stop: isRestStop
      });

      if (res.success) {
        alert('Koordinat GPS dan log status berhasil dikirim ke pembeli!');
        setSelectedOrder(null);
        fetchCourierData();
      }
    } catch (err) {
      alert(err.message || 'Gagal mengirim koordinat GPS.');
    } finally {
      setSubmittingGps(false);
    }
  };

  const handleHandoverFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto melebihi limit 5 MB.');
      return;
    }

    setHandoverPhoto(file);
    setHandoverPreview(URL.createObjectURL(file));
  };

  const handleFinishHandover = async (e) => {
    e.preventDefault();
    if (!handoverOrder || !handoverPhoto) {
      alert('Wajib mengunggah foto bukti serah terima hewan di tujuan.');
      return;
    }

    setFinishing(true);
    try {
      // 1. Upload photo
      const uploadRes = await api.uploadFile(handoverPhoto);
      const photoUrl = uploadRes.data.url;

      // 2. Submit finish handover
      const res = await api.post('/courier/finish-handover', {
        order_id: handoverOrder.id,
        recipient_name: recipientName,
        proof_photo_url: photoUrl,
        notes: handoverNotes
      });

      if (res.success) {
        alert('Serah terima hewan ternak selesai!');
        setHandoverOrder(null);
        setHandoverPhoto(null);
        setHandoverPreview('');
        fetchCourierData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menyelesaikan serah terima.');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      {/* Top Header Card */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-theme-text">Portal Logistik Armada Ternak</h1>
              <span className="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Driver Aktif
              </span>
            </div>
            <p className="text-xs text-theme-muted mt-0.5">
              Kelola armada khusus, kirim update koordinat GPS real-time, dan catat checkpoint rest-stop pakan hewan
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRegisteringFleet(!isRegisteringFleet)}
          className="px-4 py-2 bg-theme-bg border border-theme-border hover:bg-theme-border/50 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          <Truck className="w-4 h-4 text-theme-primary" />
          {isRegisteringFleet ? 'Tutup Form' : 'Daftar Armada Baru'}
        </button>
      </div>

      {/* Fleet Registration Form Drawer */}
      {isRegisteringFleet && (
        <form onSubmit={handleRegisterFleet} className="bg-theme-card border border-theme-border rounded-3xl p-6 space-y-4 text-xs animate-in slide-in-from-top">
          <h3 className="font-bold text-sm text-theme-text">Registrasi Armada Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-theme-muted block mb-1">Jenis Kendaraan</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
              >
                <option value="PICKUP">Pickup Khusus Sirkulasi</option>
                <option value="ENGKEL_TRUCK">Truk Engkel Hewan</option>
                <option value="KARGO_HEWAN">Kargo Besar Kontainer Ternak</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-theme-muted block mb-1">Nomor Polisi</label>
              <input
                type="text"
                required
                placeholder="B 9482 TNA"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-theme-muted block mb-1">Nama Driver</label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
              />
            </div>

            <div>
              <label className="font-bold text-theme-muted block mb-1">Nomor WhatsApp</label>
              <input
                type="text"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
              />
            </div>
          </div>
          <button type="submit" className="px-5 py-2 bg-theme-primary text-white font-bold rounded-xl shadow-sm">
            Simpan Armada
          </button>
        </form>
      )}

      {/* Orders List for Courier */}
      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-theme-border pb-3">
          <h2 className="text-sm font-extrabold text-theme-text">Daftar Tugas Pengantaran Ternak</h2>
          <span className="text-xs text-theme-muted">{orders.length} Tugas</span>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-theme-muted text-center py-6">Belum ada penugasan pengantaran aktif.</p>
        ) : (
          <div className="divide-y divide-theme-border/60">
            {orders.map((order) => (
              <div key={order.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-theme-text">{order.invoice_number}</span>
                    <span className="bg-theme-primary-light text-theme-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-theme-text">{order.animal?.title}</h3>
                  <p className="text-xs text-theme-muted">
                    Asal: <strong>{order.store?.farm_address || 'Kandang'}</strong> ➔ Tujuan: <strong>{order.delivery_address}</strong>
                  </p>
                  <p className="text-[11px] text-theme-muted">
                    Penerima: {order.buyer?.name} ({order.buyer?.phone_number})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Accept Order if Health Inspection passed */}
                  {order.status === 'HEALTH_INSPECTION' && !order.courier_id && (
                    <button
                      onClick={() => handleAcceptDelivery(order.id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      Terima Penugasan
                    </button>
                  )}

                  {/* Send GPS & Rest Stop Checkpoint Update */}
                  {['DISPATCHED', 'IN_TRANSIT'].includes(order.status) && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Kirim Update GPS & Rest Stop
                    </button>
                  )}

                  {/* Finish Handover Photo Proof */}
                  {order.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => setHandoverOrder(order)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Bukti Serah Terima
                    </button>
                  )}

                  {/* View on Map */}
                  <button
                    onClick={() => onOpenTracking(order.id)}
                    className="px-3 py-2 rounded-xl bg-theme-bg border border-theme-border text-xs font-bold hover:bg-theme-border/50 text-theme-text"
                  >
                    Buka Peta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GPS & Rest-Stop Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-theme-card border border-theme-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="text-base font-extrabold text-theme-text">Kirim Update Posisi GPS Armada</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-theme-muted hover:text-theme-text font-bold">✕</button>
            </div>

            <form onSubmit={handleSendGpsUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-theme-muted block mb-1">Latitude Terkini</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={currentLat}
                    onChange={(e) => setCurrentLat(parseFloat(e.target.value))}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-theme-muted block mb-1">Longitude Terkini</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={currentLng}
                    onChange={(e) => setCurrentLng(parseFloat(e.target.value))}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-theme-muted block mb-1">Label Lokasi / Milestone</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rest Area Tol Jagorawi KM 45"
                  value={statusLabel}
                  onChange={(e) => setStatusLabel(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                />
              </div>

              {/* Rest Stop Toggle */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    🌿 Checkpoint Istirahat & Pakan Ternak (Rest Stop)
                  </span>
                  <input
                    type="checkbox"
                    checked={isRestStop}
                    onChange={(e) => setIsRestStop(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </label>
                <p className="text-[10px] text-theme-muted">
                  Aktifkan jika truk berhenti untuk memberi makan konsentrat, minum air gula merah, atau mengecek ventilasi hewan.
                </p>
              </div>

              <div>
                <label className="font-bold text-theme-muted block mb-1">Catatan Kondisi Hewan</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kondisi fisik bugar, nafsu makan stabil..."
                  className="w-full bg-theme-bg border border-theme-border rounded-xl p-2.5 text-xs text-theme-text"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-theme-bg border border-theme-border text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingGps}
                  className="px-5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover shadow-md"
                >
                  {submittingGps ? 'Memancarkan...' : 'Kirim Log Pelacakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Handover Proof Modal */}
      {handoverOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-theme-card border border-theme-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="text-base font-extrabold text-theme-text">Bukti Serah Terima Hewan Hidup</h3>
              <button onClick={() => setHandoverOrder(null)} className="text-theme-muted hover:text-theme-text font-bold">✕</button>
            </div>

            <form onSubmit={handleFinishHandover} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-theme-text block mb-1">Nama Pihak Penerima</label>
                <input
                  type="text"
                  required
                  placeholder="Nama pembeli atau panitia qurban"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Foto Bukti Serah Terima (Maksimal 5 MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={handleHandoverFile}
                  className="w-full text-xs text-theme-text file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:font-bold"
                />
              </div>

              {handoverPreview && (
                <div className="rounded-2xl overflow-hidden border border-theme-border max-h-48 flex justify-center bg-slate-100 dark:bg-slate-900">
                  <img src={handoverPreview} alt="Bukti Serah Terima" className="object-contain h-48" />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHandoverOrder(null)}
                  className="px-4 py-2 rounded-xl bg-theme-bg border border-theme-border text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={finishing || !handoverPhoto}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  {finishing ? 'Menyelesaikan...' : 'Selesaikan Serah Terima'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
