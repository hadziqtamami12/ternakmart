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
  LocateFixed,
  Plus,
  Navigation,
  Sparkles,
  Clock,
  Package,
  ChevronDown
} from 'lucide-react';
import { api } from '../utils/api';
import { formatRupiah, formatWeight } from '../utils/formatters';
import { CheckoutSkeleton } from '../components/common/Skeletons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAppConfig } from '../context/AppConfigContext';
import AddressFormModal from '../components/common/AddressFormModal';

export default function CheckoutPage({ animalId, animalIds = [], voucherCode: initialVoucherCode = '', onNavigate }) {
  const { config, setDocumentTitle } = useAppConfig();
  const { user, isAuthenticated } = useAuth();
  const { removeFromCart, bulkDelete } = useCart();

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delivery & Maps state
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || 'Jl. Tebet Barat Dalam VII No. 14, Jakarta Selatan');
  const [mapsUrl, setMapsUrl] = useState('https://maps.app.goo.gl/kandang-jakarta');
  const [destLat, setDestLat] = useState(() => {
    const parsed = parseFloat(user?.latitude);
    return !isNaN(parsed) ? parsed : -6.2415;
  });
  const [destLng, setDestLng] = useState(() => {
    const parsed = parseFloat(user?.longitude);
    return !isNaN(parsed) ? parsed : 106.8532;
  });
  const [gpsStatus, setGpsStatus] = useState('');

  // Address & Expedition states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [shippingSettings, setShippingSettings] = useState(null);

  // Expedition type: 'GOTERNAK' (internal local) | 'CARGO_EXPEDITION' (3rd party API) | 'SELF_PICKUP' (0)
  const [expeditionType, setExpeditionType] = useState('GOTERNAK');
  const [selectedCourier, setSelectedCourier] = useState('JNE Trucking (JTR)');

  // Voucher state
  const [voucherCode, setVoucherCode] = useState(initialVoucherCode || '');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('MANUAL_TRANSFER'); // 'MANUAL_TRANSFER' | 'GATEWAY'
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [uniqueCode] = useState(() => Math.floor(100 + Math.random() * 899)); // 3-digit kode unik
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState('');
  const [uploadProofError, setUploadProofError] = useState('');

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

        // Load user addresses
        try {
          const addrRes = await api.get('/addresses');
          if (addrRes.success && addrRes.data && addrRes.data.length > 0) {
            setSavedAddresses(addrRes.data);
            const def = addrRes.data.find(a => a.is_default) || addrRes.data[0];
            setSelectedAddressId(def.id);
            setDeliveryAddress(def.full_address);
            if (def.latitude && def.longitude) {
              const lat = parseFloat(def.latitude);
              const lng = parseFloat(def.longitude);
              setDestLat(lat);
              setDestLng(lng);
              setMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
            }
          }
        } catch (e) { }

        // Load shipping settings
        try {
          const shipRes = await api.get('/shipping-settings');
          if (shipRes.success && shipRes.data) {
            setShippingSettings(shipRes.data);
          }
        } catch (e) { }

        setAnimals(loadedAnimals);
        const effectiveBase = loadedAnimals.reduce((acc, a) => acc + parseFloat(a.price || 0), 0);

        // Initial rates calculation
        if (loadedAnimals.length > 0) {
          await calculateRates(loadedAnimals[0].id, destLat, destLng, initialVoucherCode || '', loadedAnimals);
          if (initialVoucherCode) {
            handleApplyVoucher(initialVoucherCode, effectiveBase);
          }
        }
      } catch (err) {
        console.warn('Init checkout error:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [animalId, JSON.stringify(animalIds)]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setDeliveryAddress(addr.full_address);
    if (addr.latitude && addr.longitude) {
      const lat = parseFloat(addr.latitude);
      const lng = parseFloat(addr.longitude);
      setDestLat(lat);
      setDestLng(lng);
      setMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
      setGpsStatus(`✓ Alamat "${addr.label}" dipilih (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      calculateRates(animals[0]?.id, lat, lng, voucherCode, animals);
    }
  };

  const handleAddressCreated = (newAddr) => {
    setSavedAddresses((prev) => [newAddr, ...prev]);
    handleSelectAddress(newAddr);
    setIsAddressModalOpen(false);
  };

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

  const calculateRates = async (targetAnimalId, lat, lng, vCode, animalsList = animals, activeVoucherOverride = undefined) => {
    if (!targetAnimalId) return;
    try {
      const sumBasePrice = animalsList.reduce((acc, a) => acc + parseFloat(a.price || 0), 0);
      const res = await api.post('/orders/estimate', {
        animal_id: targetAnimalId,
        dest_lat: lat,
        dest_lng: lng,
        voucher_code: vCode || '',
        total_amount: sumBasePrice
      });
      if (res.success && res.data) {
        const rawEstimate = res.data;
        const sumBase = sumBasePrice || rawEstimate.base_price;

        let finalShipping = rawEstimate.shipping_fee;
        if (expeditionType === 'SELF_PICKUP') {
          finalShipping = 0;
        } else if (expeditionType === 'CARGO_EXPEDITION') {
          const totalWeight = animalsList.reduce((acc, a) => acc + parseFloat(a.weight_kg || 50), 0);
          finalShipping = Math.max(65000, Math.round(totalWeight * 2200));
        } else {
          finalShipping = rawEstimate.shipping_fee;
        }

        // Determine active voucher: if vCode is empty, voucher is removed (null)!
        const currentVoucher = activeVoucherOverride !== undefined
          ? activeVoucherOverride
          : (vCode ? appliedVoucher : null);

        const disc = currentVoucher
          ? parseFloat(currentVoucher.calculated_discount || currentVoucher.discount_amount || currentVoucher.discount_value || 0)
          : (vCode ? rawEstimate.admin_discount : 0);

        const subsidy = currentVoucher?.is_shipping_subsidy
          ? Math.min(disc, finalShipping)
          : (vCode ? rawEstimate.shipping_subsidy : 0);

        const adminDisc = !currentVoucher?.is_shipping_subsidy ? disc : 0;
        const grand = Math.max(0, sumBase - rawEstimate.store_discount - adminDisc + finalShipping - subsidy + rawEstimate.service_fee);

        setEstimate({
          ...rawEstimate,
          base_price: sumBase,
          original_goternak_fee: rawEstimate.shipping_fee,
          shipping_fee: finalShipping,
          admin_discount: adminDisc,
          shipping_subsidy: subsidy,
          grand_total: grand
        });
      }
    } catch (err) {
      console.warn('Estimate error:', err);
    }
  };

  // Synchronously and completely remove active coupon & restore original grand total
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
    setEstimate(prev => {
      const grand = Math.max(0, prev.base_price - (prev.store_discount || 0) + prev.shipping_fee + (prev.service_fee || 0));
      return {
        ...prev,
        admin_discount: 0,
        shipping_subsidy: 0,
        grand_total: grand
      };
    });
  };

  // Immediate synchronous calculation when expedition option is selected
  const handleSelectExpedition = (type) => {
    setExpeditionType(type);
    const sumBase = estimate.base_price || animals.reduce((acc, a) => acc + parseFloat(a.price || 0), 0);
    let newShipping = 0;
    if (type === 'GOTERNAK') {
      const baseFee = shippingSettings?.goternak_base_fee || 20000;
      const perKm = shippingSettings?.goternak_per_km_fee || 4000;
      newShipping = estimate.original_goternak_fee || (baseFee + perKm * (estimate.distance_km || 15));
    } else if (type === 'CARGO_EXPEDITION') {
      const totalWeight = animals.reduce((acc, a) => acc + parseFloat(a.weight_kg || 50), 0);
      newShipping = Math.max(65000, Math.round(totalWeight * 2200));
    } else {
      newShipping = 0; // SELF_PICKUP
    }

    const adminDisc = estimate.admin_discount || 0;
    const storeDisc = estimate.store_discount || 0;
    const subsidy = (type === 'GOTERNAK' && estimate.shipping_subsidy) ? estimate.shipping_subsidy : 0;
    const sFee = estimate.service_fee || 35000;
    const grand = Math.max(0, sumBase - storeDisc - adminDisc + newShipping - subsidy + sFee);

    setEstimate(prev => ({
      ...prev,
      shipping_fee: newShipping,
      grand_total: grand
    }));
  };

  const handleApplyVoucher = async (codeToUse, explicitAmount) => {
    const code = (typeof codeToUse === 'string' ? codeToUse : voucherCode || '').trim().toUpperCase();
    if (!code) return;
    setVoucherError('');
    try {
      const calcAmount = explicitAmount || estimate.base_price || animals.reduce((acc, a) => acc + parseFloat(a.price || 0), 0);
      const res = await api.post('/vouchers/check', {
        code: code,
        amount: calcAmount
      });
      if (res.success && res.data) {
        const vch = res.data;
        setAppliedVoucher(vch);
        setVoucherCode(code);
        const discountNominal = parseFloat(vch.calculated_discount || vch.discount_amount || vch.discount_value || 0);

        setEstimate(prev => {
          const subsidy = vch.is_shipping_subsidy ? Math.min(discountNominal, prev.shipping_fee) : (prev.shipping_subsidy || 0);
          const adminDisc = !vch.is_shipping_subsidy ? discountNominal : (prev.admin_discount || 0);
          const grand = Math.max(0, prev.base_price - prev.store_discount - adminDisc + prev.shipping_fee - subsidy + prev.service_fee);
          return {
            ...prev,
            admin_discount: adminDisc,
            shipping_subsidy: subsidy,
            grand_total: grand
          };
        });
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
          selected_bank: selectedBank,
          unique_code: uniqueCode,
          payment_proof_url: paymentProofPreview || undefined,
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
    { code: 'BCA', name: 'BCA Mitra Farm', number: '8830192841', holder: 'H. Syamsul Bahri (Barokah Farm)', type: 'BANK' },
    { code: 'MANDIRI', name: 'Mandiri Mitra', number: '1310029384910', holder: 'Peternakan Berkah Barokah', type: 'BANK' },
    { code: 'BRI', name: 'BRI Agro', number: '034101000982301', holder: 'Koperasi Peternak Mandiri', type: 'BANK' },
    { code: 'QRIS', name: 'QRIS Peternak', number: 'ID1020304050607', holder: 'TernakMart Escrow & Farm', type: 'EWALLET' },
    { code: 'GOPAY', name: 'GoPay Farm', number: '081234567890', holder: 'Mitra Barokah Ternak', type: 'EWALLET' }
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

          {/* Delivery Address & Tikor Picker */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-theme-primary" /> Alamat & Titik Koordinat (Tikor) Pengiriman
              </h2>
              {/* <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="text-xs font-bold text-theme-primary hover:text-theme-primary-hover flex items-center gap-1 bg-theme-primary-light/30 px-3 py-1.5 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Alamat Baru</span>
              </button> */}
            </div>

            {/* Saved addresses selector */}
            {savedAddresses && savedAddresses.length > 0 ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-theme-muted block">
                  Pilih Alamat Tersimpan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${isSelected
                            ? 'border-theme-primary bg-theme-primary-light/20 ring-2 ring-theme-primary/20 shadow-sm'
                            : 'border-theme-border bg-theme-bg/60 hover:border-theme-primary/40'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-theme-text">{addr.label}</span>
                            {addr.is_default && (
                              <span className="text-[10px] bg-theme-primary/10 text-theme-primary font-bold px-1.5 py-0.5 rounded-md">
                                Utama
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-theme-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-theme-text line-clamp-1">
                          {addr.recipient_name} ({addr.phone_number})
                        </p>
                        <p className="text-[11px] text-theme-muted line-clamp-2 mt-0.5">
                          {addr.full_address}
                        </p>
                        {addr.latitude && addr.longitude && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            <Navigation className="w-3 h-3" />
                            <span>Tikor: {Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Manual address detail or fallback */}
            <div className="space-y-3 pt-1">
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

              {/* Peta Lokasi Pengiriman Sesuai Alamat Form */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                    <label className="text-xs font-bold text-theme-text">
                      Peta Lokasi Pengiriman (Otomatis Sesuai Alamat)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      className="text-[11px] text-theme-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span>Deteksi GPS Saya</span>
                    </button>
                    {deliveryAddress && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-theme-muted hover:text-theme-primary flex items-center gap-1"
                        title="Buka di Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Maps</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Live Embedded Map Matching Address */}
                <div className="relative rounded-2xl overflow-hidden border border-theme-border bg-theme-bg shadow-inner h-52 sm:h-60 w-full">
                  {deliveryAddress?.trim() ? (
                    <iframe
                      title="Peta Lokasi Pengiriman"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(deliveryAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-theme-muted space-y-2">
                      <MapPin className="w-8 h-8 text-theme-muted/50 animate-bounce" />
                      <p className="text-xs font-semibold">Ketik alamat lengkap di atas untuk memuat peta lokasi pengiriman.</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-theme-muted pt-0.5">
                  <span className="truncate">
                    Tikor Presisi: {(parseFloat(destLat) || -6.2415).toFixed(4)}, {(parseFloat(destLng) || 106.8532).toFixed(4)}
                  </span>
                  {gpsStatus && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate">
                      {gpsStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE DELIVERY SELECTION CARDS (Mobile-First & Instant Adjustment) */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
                  <Truck className="w-4 h-4 text-theme-primary" /> Opsi Pengiriman & Logistik Hewan
                </h2>
                <p className="text-xs text-theme-muted mt-0.5">
                  Pilih armada khusus hewan hidup atau kargo logistik terpercaya
                </p>
              </div>
              <span className="text-[11px] font-bold text-theme-primary bg-theme-primary/10 px-2.5 py-1 rounded-full">
                Jarak: ~{estimate.distance_km} km
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {/* CARD 1: GoTernak Kurir Khusus Hewan Ternak */}
              <div
                onClick={() => handleSelectExpedition('GOTERNAK')}
                className={`p-4 rounded-3xl border cursor-pointer transition-all relative overflow-hidden ${expeditionType === 'GOTERNAK'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30 shadow-md'
                    : 'border-theme-border bg-theme-bg/60 hover:border-emerald-500/50'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-theme-text">GoTernak</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> Mitra Resmi GoTernak
                        </span>
                      </div>
                      <p className="text-xs font-medium text-theme-muted mt-1 leading-relaxed">
                        Armada khusus ternak (Pick-up / Engkel berterpal sekat). Dilengkapi jerami pakan, ventilasi sejuk, dan garansi kesehatan selama perjalanan.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                        <span className="flex items-center gap-1 text-theme-muted">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Estimasi: <strong>1 - 2 Hari</strong></span>
                        </span>
                        <span className="flex items-center gap-1 text-theme-muted">
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Jarak: <strong>{estimate.distance_km} km</strong> (Tikor Presisi)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0 pl-13 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-theme-border/40">
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(estimate.original_goternak_fee || estimate.shipping_fee || ((shippingSettings?.goternak_base_fee || 20000) + ((shippingSettings?.goternak_per_km_fee || 4000) * (estimate.distance_km || 15))))}
                    </div>
                    <div className="text-[10px] text-theme-muted mt-0.5">
                      Formula Rp {(shippingSettings?.goternak_per_km_fee || 4000).toLocaleString('id-ID')}/km
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: Kargo Logistik Pihak Ketiga */}
              <div
                onClick={() => handleSelectExpedition('CARGO_EXPEDITION')}
                className={`p-4 rounded-3xl border cursor-pointer transition-all relative overflow-hidden ${expeditionType === 'CARGO_EXPEDITION'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/30 shadow-md'
                    : 'border-theme-border bg-theme-bg/60 hover:border-blue-500/50'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-theme-text">Ekspedisi Kargo Pihak Ketiga</span>
                        <span className="text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          Pakan & Logistik
                        </span>
                      </div>
                      <p className="text-xs font-medium text-theme-muted mt-1 leading-relaxed">
                        Cocok untuk produk non-hewan hidup (pakan ternak, suplemen, obat) atau hewan kecil berbox karantina resmi standar ekspedisi.
                      </p>

                      {/* Courier Selection Pills */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {['JNE Trucking (JTR)', 'SiCepat Gokil', 'Kalog Express'].map((courier) => (
                          <button
                            key={courier}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourier(courier);
                              handleSelectExpedition('CARGO_EXPEDITION');
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${selectedCourier === courier && expeditionType === 'CARGO_EXPEDITION'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-theme-border/50 text-theme-muted hover:text-theme-text'
                              }`}
                          >
                            {courier}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 mt-2.5 text-xs text-theme-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Estimasi: <strong>2 - 4 Hari Kerja</strong></span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0 pl-13 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-theme-border/40">
                    <div className="text-base font-black text-blue-600 dark:text-blue-400">
                      {formatRupiah(Math.max(65000, Math.round((animals.reduce((acc, a) => acc + parseFloat(a.weight_kg || 50), 0)) * 2200)))}
                    </div>
                    <div className="text-[10px] text-theme-muted mt-0.5">
                      Tarif Terintegrasi API
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: Ambil di Kandang (Self Pickup) */}
              <div
                onClick={() => handleSelectExpedition('SELF_PICKUP')}
                className={`p-4 rounded-3xl border cursor-pointer transition-all relative overflow-hidden ${expeditionType === 'SELF_PICKUP'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/30 shadow-md'
                    : 'border-theme-border bg-theme-bg/60 hover:border-amber-500/50'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-theme-text">Ambil Sendiri di Kandang (Self-Pickup)</span>
                        <span className="text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                          Bebas Ongkir
                        </span>
                      </div>
                      <p className="text-xs font-medium text-theme-muted mt-1 leading-relaxed">
                        Bawa kendaraan sendiri ke kandang mitra peternak. Periksa kondisi fisik, bobot, dan sertifikat kesehatan ternak secara langsung di lokasi.
                      </p>

                      <div className="flex items-center gap-3 mt-3 text-xs text-theme-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Jadwal Fleksibel (Koordinasi via Chat Penjual)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0 pl-13 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-theme-border/40">
                    <div className="text-base font-black text-amber-600 dark:text-amber-400">
                      GRATIS (Rp 0)
                    </div>
                    <div className="text-[10px] text-theme-muted mt-0.5">
                      Tanpa biaya kirim
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DEDICATED PROMO VOUCHER CARD (Prominent on Mobile & Desktop) */}
          <div className="bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
                <Tag className="w-4 h-4 text-theme-primary" /> Kupon Promo & Diskon Belanja
              </h2>
              <span className="text-[10px] font-extrabold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Hemat s/d 15%
              </span>
            </div>

            {/* Quick Coupon Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-theme-muted">Rekomendasi kupon:</span>
              <button
                type="button"
                onClick={() => {
                  setVoucherCode('QURBANBERKAH');
                  handleApplyVoucher('QURBANBERKAH');
                }}
                className="px-2.5 py-1 rounded-xl bg-theme-primary/10 hover:bg-theme-primary/20 border border-theme-primary/30 text-theme-primary font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>QURBANBERKAH (15% OFF)</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik kode kupon (cth: QURBANBERKAH)"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
              <button
                type="button"
                onClick={() => handleApplyVoucher(voucherCode)}
                className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
              >
                Gunakan Kupon
              </button>
            </div>

            {appliedVoucher && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    Kupon <strong>{appliedVoucher.voucher_code}</strong> aktif! Potongan: -{formatRupiah(appliedVoucher.calculated_discount || appliedVoucher.discount_amount || appliedVoucher.discount_value || estimate.admin_discount || 0)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="text-xs text-rose-500 hover:underline font-bold flex-shrink-0 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}

            {voucherError && (
              <p className="text-xs text-rose-500 font-semibold">{voucherError}</p>
            )}
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
                className={`p-4 rounded-2xl border text-left transition-all ${paymentMethod === 'MANUAL_TRANSFER'
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
                className={`p-4 rounded-2xl border text-left transition-all ${paymentMethod === 'GATEWAY'
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
                  Pilih Rekening Bank / E-Wallet Mitra Peternak:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {bankAccounts.map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => setSelectedBank(b.code)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${selectedBank === b.code
                          ? 'border-theme-primary bg-theme-primary-light text-theme-primary font-black shadow-sm'
                          : 'border-theme-border bg-theme-bg text-theme-muted hover:border-theme-text'
                        }`}
                    >
                      <span className="text-[11px] block truncate">{b.name}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Bank Details */}
                {(() => {
                  const curr = bankAccounts.find(b => b.code === selectedBank) || bankAccounts[0];
                  return (
                    <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border text-xs space-y-2.5">
                      <div className="flex justify-between items-center pb-2 border-b border-theme-border/60">
                        <div>
                          <span className="text-[10px] text-theme-muted block uppercase font-bold">Nomor Rekening / E-Wallet</span>
                          <span className="font-mono text-base font-black text-theme-text">{curr.number}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(curr.number);
                            alert(`Nomor ${curr.code} (${curr.number}) disalin!`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-theme-card border border-theme-border text-[10px] font-bold text-theme-primary hover:bg-theme-primary-light transition-all"
                        >
                          Salin Nomor
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-muted">Penerima:</span>
                        <span className="font-bold text-theme-text">{curr.holder}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-theme-border/60">
                        <span className="text-theme-muted flex items-center gap-1">
                          <span>Kode Unik Verifikasi:</span>
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">Otomatis</span>
                        </span>
                        <span className="font-mono font-black text-amber-600 text-sm">+{uniqueCode}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Upload Bukti Transfer Form */}
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-semibold text-theme-muted block">
                    Upload Bukti Transfer (Struk / Tangkapan Layar / PDF):
                  </label>

                  <div className="p-4 rounded-2xl border-2 border-dashed border-theme-border bg-theme-bg/50 hover:bg-theme-bg transition-colors flex flex-col items-center justify-center text-center">
                    <input
                      type="file"
                      id="payment-proof-input"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setUploadProofError('');
                        if (!file) return;

                        // Validation: Size < 5MB
                        if (file.size > 5 * 1024 * 1024) {
                          setUploadProofError('Ukuran file melebihi batas 5MB.');
                          return;
                        }

                        // Validation: Type
                        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
                        if (!validTypes.includes(file.type)) {
                          setUploadProofError('Format harus berupa JPG, PNG, WEBP, atau PDF.');
                          return;
                        }

                        setPaymentProofFile(file);
                        const reader = new FileReader();
                        reader.onload = () => {
                          setPaymentProofPreview(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />

                    {paymentProofPreview ? (
                      <div className="space-y-2 flex flex-col items-center">
                        {paymentProofFile?.type === 'application/pdf' ? (
                          <div className="p-3 bg-red-500/10 text-red-600 rounded-xl font-bold text-xs flex items-center gap-2">
                            <span>📄 Dokumen PDF: {paymentProofFile.name}</span>
                          </div>
                        ) : (
                          <img
                            src={paymentProofPreview}
                            alt="Bukti Transfer"
                            className="max-h-32 rounded-xl object-contain border border-theme-border shadow-sm"
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-emerald-600 font-bold">✓ Bukti siap dilampirkan ({((paymentProofFile?.size || 0) / 1024).toFixed(0)} KB)</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentProofFile(null);
                              setPaymentProofPreview('');
                            }}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            Ganti
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="payment-proof-input"
                        className="cursor-pointer space-y-1.5 flex flex-col items-center"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-theme-text">Klik untuk Pilih File Bukti Transfer</span>
                        <p className="text-[10px] text-theme-muted">Mendukung format JPG, PNG, WebP, PDF (Maks. 5 MB)</p>
                      </label>
                    )}
                  </div>

                  {uploadProofError && (
                    <p className="text-[11px] text-red-500 font-medium">{uploadProofError}</p>
                  )}
                </div>
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
                  placeholder="Kode voucher (cth: QURBANBERKAH)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleApplyVoucher(voucherCode)}
                  className="px-4 py-2 bg-theme-primary text-white hover:bg-theme-primary-hover text-xs font-bold rounded-xl transition-colors"
                >
                  Terapkan
                </button>
              </div>
              {appliedVoucher && (
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Kupon {appliedVoucher.voucher_code} aktif! Diskon -{formatRupiah(appliedVoucher.calculated_discount || appliedVoucher.discount_amount || appliedVoucher.discount_value || estimate.admin_discount || 0)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-rose-500 hover:underline text-[10px] font-bold cursor-pointer"
                  >
                    Hapus
                  </button>
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

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <AddressFormModal
          onClose={() => setIsAddressModalOpen(false)}
          onSaved={handleAddressCreated}
        />
      )}
    </div>
  );
}
