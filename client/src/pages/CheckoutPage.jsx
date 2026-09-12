// CheckoutPage.jsx - Transparent Multi-Fee Formula, Google Maps Link, Expedition Choices & Bulk Support
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Tag,
  CheckCircle2,
  ArrowRight,
  Info,
  MapPin,
  ExternalLink,
  LocateFixed
} from 'lucide-react';
import { api } from '../utils/api';
import { formatRupiah, formatWeight } from '../utils/formatters';
import { CheckoutSkeleton } from '../components/common/Skeletons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAppConfig } from '../context/AppConfigContext';

export default function CheckoutPage({ animalId, animalIds = [], onNavigate }) {
  const { config, setDocumentTitle } = useAppConfig();
  const { user, isAuthenticated } = useAuth();
  const { removeFromCart, bulkDelete } = useCart();

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delivery & Maps state
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || 'Jl. Tebet Barat Dalam VII No. 14, Jakarta Selatan');
  const [mapsUrl, setMapsUrl] = useState('https://maps.app.goo.gl/kandang-jakarta');
  const [destLat, setDestLat] = useState(user?.latitude || -6.2415);
  const [destLng, setDestLng] = useState(user?.longitude || 106.8532);
  const [gpsStatus, setGpsStatus] = useState('');

  // Expedition type: 'OFFICIAL_COURIER' (per km) | 'API_EXPEDITION' (flat cargo) | 'SELF_PICKUP' (0)
  const [expeditionType, setExpeditionType] = useState('OFFICIAL_COURIER');

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('MANUAL_TRANSFER'); // 'MANUAL_TRANSFER' | 'GATEWAY'
  const [selectedBank, setSelectedBank] = useState('BCA');

  // Estimate state
  const [estimate, setEstimate] = useState({
    base_price: 0,
    store_discount: 0,
    admin_discount: 0,
    shipping_fee: 0,
    shipping_subsidy: 0,
    service_fee: 35000,
    grand_total: 0,
    distance_km: 18
  });

  useEffect(() => {
    setDocumentTitle('Checkout Transparan');
    const initData = async () => {
      try {
        setLoading(true);
        const targetIds = (animalIds && animalIds.length > 0) ? animalIds : [animalId || 'anm_001'];
        const loadedAnimals = [];

        for (const id of targetIds) {
          try {
            const res = await api.get(`/animals/detail/${id}`);
            if (res.success && res.data) {
              loadedAnimals.push(res.data);
            }
          } catch (e) {
            console.warn(`Failed loading animal ${id}:`, e);
          }
        }

        // Fallback if none found
        if (loadedAnimals.length === 0) {
          const res = await api.get('/animals/detail/anm_001');
          if (res.success && res.data) loadedAnimals.push(res.data);
        }

        setAnimals(loadedAnimals);

        // Initial rates calculation
        if (loadedAnimals.length > 0) {
          await calculateRates(loadedAnimals[0].id, destLat, destLng, '', loadedAnimals);
        }
      } catch (err) {
        console.warn('Init checkout error:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [animalId, JSON.stringify(animalIds)]);

  // Parse Google Maps Link or text to extract coordinates
  const handleMapsUrlChange = (url) => {
    setMapsUrl(url);
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)|!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
      const lat = parseFloat(match[1] || match[3] || match[5]);
      const lng = parseFloat(match[2] || match[4] || match[6]);
      setDestLat(lat);
      setDestLng(lng);
      setGpsStatus(`✓ Koordinat terdeteksi (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      calculateRates(animals[0]?.id, lat, lng, voucherCode, animals);
    } else if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
      setGpsStatus('✓ Link Google Maps valid terpasang');
      calculateRates(animals[0]?.id, destLat, destLng, voucherCode, animals);
    } else {
      setGpsStatus('');
    }
  };

  // Get current device GPS
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung browser ini.');
      return;
    }
    setGpsStatus('Mencari posisi satelit GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDestLat(lat);
        setDestLng(lng);
        setMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
        setGpsStatus(`✓ Lokasi GPS terdeteksi presisi (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        calculateRates(animals[0]?.id, lat, lng, voucherCode, animals);
      },
      (err) => {
        setGpsStatus('Tidak dapat mendeteksi GPS. Masukkan link Google Maps manual.');
      },
      { timeout: 10000 }
    );
  };

  const calculateRates = async (targetAnimalId, lat, lng, vCode, animalsList = animals) => {
    if (!targetAnimalId) return;
    try {
      const res = await api.post('/orders/estimate', {
        animal_id: targetAnimalId,
        dest_lat: lat,
        dest_lng: lng,
        voucher_code: vCode
      });
      if (res.success && res.data) {
        const rawEstimate = res.data;
        // If multiple animals, sum base prices and adjust shipping
        const multiplier = animalsList.length > 1 ? animalsList.length : 1;
        const sumBasePrice = animalsList.reduce((acc, a) => acc + parseFloat(a.price || 0), 0) || rawEstimate.base_price;

        let finalShipping = rawEstimate.shipping_fee;
        if (expeditionType === 'SELF_PICKUP') {
          finalShipping = 0;
        } else if (expeditionType === 'API_EXPEDITION') {
          // Standard cargo flat rate based on weight
          const totalWeight = animalsList.reduce((acc, a) => acc + parseFloat(a.weight_kg || 50), 0);
          finalShipping = Math.max(150000, Math.round(totalWeight * 2500));
        }

        const grand = Math.max(0, sumBasePrice - rawEstimate.store_discount - rawEstimate.admin_discount + finalShipping - rawEstimate.shipping_subsidy + rawEstimate.service_fee);

        setEstimate({
          ...rawEstimate,
          base_price: sumBasePrice,
          shipping_fee: finalShipping,
          grand_total: grand
        });
      }
    } catch (err) {
      console.warn('Estimate error:', err);
    }
  };

  // Re-calculate when expedition type changes
  useEffect(() => {
    if (animals.length > 0) {
      calculateRates(animals[0].id, destLat, destLng, voucherCode, animals);
    }
  }, [expeditionType]);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherError('');
    try {
      const res = await api.post('/vouchers/check', {
        code: voucherCode,
        amount: estimate.base_price
      });
      if (res.success && res.data) {
        setAppliedVoucher(res.data);
        await calculateRates(animals[0]?.id, destLat, destLng, voucherCode, animals);
      }
    } catch (err) {
      setVoucherError(err.message || 'Kupon tidak dapat digunakan.');
      setAppliedVoucher(null);
    }
  };

  const handleSubmitOrder = async () => {
    if (!deliveryAddress) {
      alert('Mohon isi alamat lengkap pengiriman ternak.');
      return;
    }

    setSubmitting(true);
    try {
      // Process orders for all animals
      let lastOrderId = null;
      const animalIdsToDelete = [];

      for (const anm of animals) {
        const res = await api.post('/orders/create', {
          animal_id: anm.id,
          payment_method: paymentMethod,
          delivery_address: `${deliveryAddress} (Gmaps: ${mapsUrl})`,
          dest_lat: destLat,
          dest_lng: destLng,
          logistics_type: expeditionType,
          voucher_code: appliedVoucher ? appliedVoucher.voucher_code : undefined
        });
        if (res.success && res.data) {
          lastOrderId = res.data.id;
          animalIdsToDelete.push(anm.id);
        }
      }

      // Cleanup cart
      if (animalIdsToDelete.length > 0) {
        await bulkDelete(animalIdsToDelete);
      }

      // Navigate to orders
      onNavigate('orders', { newOrderId: lastOrderId });
    } catch (err) {
      alert(err.message || 'Gagal memproses pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-theme-text">Rincian Checkout Ternak</h1>
        <CheckoutSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-theme-primary flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-theme-text">Silakan Masuk untuk Menyelesaikan Checkout</h2>
        <p className="text-xs text-theme-muted">
          Pilihan ternak Anda telah tersimpan rapi. Masuk atau daftar akun untuk melanjutkan alamat pengiriman dan pembayaran transparan.
        </p>
        <button
          onClick={() => onNavigate('auth', { redirect: 'checkout', animalId: animals[0]?.id })}
          className="px-6 py-3 bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold rounded-2xl shadow-md transition-all"
        >
          Masuk / Daftar Akun Sekarang
        </button>
      </div>
    );
  }

  const bankAccounts = [
    { code: 'BCA', name: 'Bank Central Asia', number: '8830192841', holder: 'PT TERNAKMART INDONESIA' },
    { code: 'MANDIRI', name: 'Bank Mandiri', number: '1310029384910', holder: 'PT TERNAKMART INDONESIA' },
    { code: 'BRI', name: 'Bank Rakyat Indonesia', number: '034101000982301', holder: 'PT TERNAKMART INDONESIA' },
    { code: 'BNI', name: 'Bank Negara Indonesia', number: '9928172635', holder: 'PT TERNAKMART INDONESIA' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 pb-32 overflow-x-hidden">
      <div className="border-b border-theme-border pb-4">
        <h1 className="text-xl sm:text-3xl font-extrabold text-theme-text tracking-tight">
          Checkout & Pembayaran Transparan
        </h1>
        <p className="text-xs sm:text-sm text-theme-muted mt-1">
          Kalkulasi biaya riil terbuka tanpa mark-up liar & proteksi asuransi ternak hidup selama perjalanan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery & Payment Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Animal Cards List */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-theme-border pb-2">
              <span className="text-xs font-bold text-theme-text">
                Daftar Hewan Ternak ({animals.length} Ekor)
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Sertifikat SKKH Aktif
              </span>
            </div>

            <div className="divide-y divide-theme-border/60">
              {animals.map((anm) => (
                <div key={anm.id} className="py-3 flex gap-4 items-center">
                  <img
                    src={(anm.images && anm.images[0]) || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'}
                    alt={anm.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-theme-border flex-shrink-0"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <span className="text-[9px] font-black tracking-wider bg-theme-primary-light text-theme-primary px-2 py-0.5 rounded">
                      {anm.category}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-theme-text truncate">{anm.title}</h3>
                    <p className="text-[11px] text-theme-muted">
                      Bobot: {formatWeight(anm.weight_kg)} | Ras: {anm.breed || 'Unggul'}
                    </p>
                    <div className="text-xs sm:text-sm font-extrabold text-theme-primary pt-0.5">
                      {formatRupiah(anm.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Google Maps Link */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <MapPin className="w-4 h-4 text-theme-primary" /> Alamat & Link Google Maps Tujuan
            </h2>

            <div className="space-y-3">
              {/* Alamat Lengkap */}
              <div>
                <label className="text-xs font-semibold text-theme-muted block mb-1">
                  Alamat Lengkap Penerima / Kandang Tujuan
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-2xl p-3 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, patokan kandang/halaman"
                />
              </div>

              {/* Google Maps Link Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-theme-muted">
                    Link Google Maps (Contoh: https://maps.app.goo.gl/xxxx)
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="text-[11px] text-theme-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>Deteksi GPS Saya</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={mapsUrl}
                    onChange={(e) => handleMapsUrlChange(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text pr-10 focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                  />
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-2.5 text-theme-muted hover:text-theme-primary"
                      title="Buka link di tab baru"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {gpsStatus && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    {gpsStatus}
                  </p>
                )}
              </div>

              {/* Expedition Method Choice */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-theme-muted block mb-2">
                  Pilihan Ekspedisi & Logistik Ternak
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExpeditionType('OFFICIAL_COURIER')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      expeditionType === 'OFFICIAL_COURIER'
                        ? 'border-theme-primary bg-theme-primary-light/30 ring-2 ring-theme-primary/20'
                        : 'border-theme-border bg-theme-bg hover:bg-theme-border/30'
                    }`}
                  >
                    <div className="font-bold text-xs text-theme-text flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-theme-primary" />
                      <span>Armada Mandiri</span>
                    </div>
                    <p className="text-[10px] text-theme-muted mt-1">
                      Kalkulasi per km (Rp 8.500/km) + kandang sejuk
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpeditionType('API_EXPEDITION')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      expeditionType === 'API_EXPEDITION'
                        ? 'border-theme-primary bg-theme-primary-light/30 ring-2 ring-theme-primary/20'
                        : 'border-theme-border bg-theme-bg hover:bg-theme-border/30'
                    }`}
                  >
                    <div className="font-bold text-xs text-theme-text flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>API Cargo Ternak</span>
                    </div>
                    <p className="text-[10px] text-theme-muted mt-1">
                      Kalog / Herona Express tarif terstandar
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpeditionType('SELF_PICKUP')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      expeditionType === 'SELF_PICKUP'
                        ? 'border-theme-primary bg-theme-primary-light/30 ring-2 ring-theme-primary/20'
                        : 'border-theme-border bg-theme-bg hover:bg-theme-border/30'
                    }`}
                  >
                    <div className="font-bold text-xs text-theme-text flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ambil di Kandang</span>
                    </div>
                    <p className="text-[10px] text-theme-muted mt-1">
                      Gratis ongkir (Rp 0) langsung cek di kandang
                    </p>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-theme-muted pt-1">
                Jarak estimasi: <strong>{estimate.distance_km} km</strong> dari kandang mitra peternak.
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-theme-primary" /> Metode Pembayaran
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('MANUAL_TRANSFER')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'MANUAL_TRANSFER'
                    ? 'border-theme-primary bg-theme-primary-light/30 ring-2 ring-theme-primary/20'
                    : 'border-theme-border bg-theme-bg hover:bg-theme-border/30'
                }`}
              >
                <div className="font-bold text-xs text-theme-text flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-theme-primary" />
                  <span>Transfer Bank Manual</span>
                </div>
                <p className="text-[11px] text-theme-muted mt-1 leading-relaxed">
                  Unggah bukti transfer struk (BCA, Mandiri, BRI, BNI). Verifikasi cepat.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('GATEWAY')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'GATEWAY'
                    ? 'border-theme-primary bg-theme-primary-light/30 ring-2 ring-theme-primary/20'
                    : 'border-theme-border bg-theme-bg hover:bg-theme-border/30'
                }`}
              >
                <div className="font-bold text-xs text-theme-text flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Virtual Account / QRIS</span>
                </div>
                <p className="text-[11px] text-theme-muted mt-1 leading-relaxed">
                  Konfirmasi pembayaran otomatis seketika melalui QRIS atau VA.
                </p>
              </button>
            </div>

            {/* Bank Accounts Info for Manual Transfer */}
            {paymentMethod === 'MANUAL_TRANSFER' && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-theme-muted block">
                  Pilih Rekening Tujuan Transfer:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {bankAccounts.map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => setSelectedBank(b.code)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedBank === b.code
                          ? 'border-theme-primary bg-theme-primary-light text-theme-primary font-black'
                          : 'border-theme-border bg-theme-bg text-theme-muted hover:border-theme-text'
                      }`}
                    >
                      <span className="text-xs">{b.name}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Bank Details */}
                {(() => {
                  const curr = bankAccounts.find(b => b.code === selectedBank) || bankAccounts[0];
                  return (
                    <div className="p-3.5 rounded-2xl bg-theme-bg border border-theme-border text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-theme-muted">Nomor Rekening:</span>
                        <span className="font-mono font-bold text-theme-text">{curr.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-muted">Atas Nama:</span>
                        <span className="font-bold text-theme-text">{curr.holder}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Transparent Formula (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-6 space-y-5 shadow-elevated sticky top-20">
            <h2 className="text-base font-extrabold text-theme-text border-b border-theme-border pb-3">
              Rincian Formula Transparan
            </h2>

            {/* Voucher Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kode voucher (cth: BERKAHQURBAN)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="px-4 py-2 bg-theme-bg border border-theme-border hover:bg-theme-border/50 text-xs font-bold rounded-xl transition-colors"
                >
                  Terapkan
                </button>
              </div>
              {appliedVoucher && (
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kupon {appliedVoucher.voucher_code} aktif! Diskon {formatRupiah(appliedVoucher.discount_amount)}</span>
                </div>
              )}
              {voucherError && (
                <p className="text-[11px] text-red-500 font-medium">{voucherError}</p>
              )}
            </div>

            {/* Transparent Calculation Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-theme-muted">
                <span>Harga Hewan Ternak ({animals.length} ekor)</span>
                <span className="font-bold text-theme-text">{formatRupiah(estimate.base_price)}</span>
              </div>

              {estimate.store_discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Peternak</span>
                  <span className="font-bold">-{formatRupiah(estimate.store_discount)}</span>
                </div>
              )}

              {estimate.admin_discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Promo Platform</span>
                  <span className="font-bold">-{formatRupiah(estimate.admin_discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-theme-muted">
                <span>
                  Ongkos Kirim ({expeditionType === 'SELF_PICKUP' ? 'Ambil Sendiri' : `${estimate.distance_km} km`})
                </span>
                <span className="font-bold text-theme-text">
                  {estimate.shipping_fee === 0 ? 'GRATIS' : formatRupiah(estimate.shipping_fee)}
                </span>
              </div>

              {estimate.shipping_subsidy > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Subsidi Ongkir Ternakmart</span>
                  <span className="font-bold">-{formatRupiah(estimate.shipping_subsidy)}</span>
                </div>
              )}

              <div className="flex justify-between text-theme-muted">
                <span className="flex items-center gap-1">
                  <span>Biaya Layanan & Asuransi Hidup</span>
                  <Info className="w-3 h-3" title="Termasuk garansi hewan hidup sampai tujuan" />
                </span>
                <span className="font-bold text-theme-text">{formatRupiah(estimate.service_fee)}</span>
              </div>

              <div className="border-t border-theme-border pt-3 mt-2 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-theme-text">Total Pembayaran</span>
                <span className="text-xl font-black text-theme-primary">
                  {formatRupiah(estimate.grand_total)}
                </span>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full py-3.5 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Memproses Pesanan...</span>
              ) : (
                <>
                  <span>Bayar Sekarang ({formatRupiah(estimate.grand_total)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
