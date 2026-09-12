import { Store, ArrowLeft, Building2, MapPin, Upload, AlertCircle, LogIn } from 'lucide-react';
import { api } from '../utils/api';
import { useAppConfig } from '../context/AppConfigContext';
import { useAuth } from '../context/AuthContext';

export default function RegisterStorePage({ onBack, onSuccess, onNavigate }) {
  const { setDocumentTitle } = useAppConfig();
  const { isAuthenticated } = useAuth();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [latitude, setLatitude] = useState(-6.6895);
  const [longitude, setLongitude] = useState(106.7869);
  const [farmPhotoUrl, setFarmPhotoUrl] = useState('');
  const [nibSkuNumber, setNibSkuNumber] = useState('');
  const [bankName, setBankName] = useState('BCA');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setDocumentTitle('Daftar Kandang Peternakan');
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto fasilitas kandang melebihi limit 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.data?.url) {
        setFarmPhotoUrl(res.data.url);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengunggah foto kandang.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/stores/register', {
        store_name: storeName,
        description,
        farm_address: farmAddress,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        farm_photo_url: farmPhotoUrl,
        nib_sku_number: nibSkuNumber,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_holder: bankAccountHolder
      });

      if (res.success) {
        alert('Pendaftaran kandang berhasil diajukan! Menunggu approval tim Admin Ternakmart.');
        if (onSuccess) onSuccess();
        else onBack();
      }
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan toko kandang.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Store className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-theme-text">Silakan Masuk Terlebih Dahulu</h2>
        <p className="text-xs text-theme-muted">
          Pendaftaran toko/kandang peternakan hanya dapat diajukan oleh pengguna yang telah terdaftar dan login.
        </p>
        <button
          onClick={() => (onNavigate ? onNavigate('auth') : onBack())}
          className="px-5 py-2.5 bg-theme-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 mx-auto"
        >
          <LogIn className="w-4 h-4" /> Masuk Akun
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-theme-border pb-4">
          <h1 className="text-2xl font-extrabold text-theme-text flex items-center gap-2">
            <Store className="w-6 h-6 text-theme-primary" />
            Pendaftaran Kandang Peternakan Mitra
          </h1>
          <p className="text-xs text-theme-muted mt-0.5">
            Lengkapi data usaha, koordinat kandang penjemputan armada, dan rekening pencairan hasil penjualan
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-theme-text block mb-1">Nama Toko / Kandang Peternakan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Barokah Cattle & Goat Farm"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2.5 text-xs text-theme-text"
            />
          </div>

          <div>
            <label className="font-bold text-theme-text block mb-1">Deskripsi Peternakan & Keunggulan</label>
            <textarea
              rows={2}
              placeholder="Jelaskan jenis ternak yang dibudidayakan, jaminan pakan, dan legalitas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text"
            />
          </div>

          <div>
            <label className="font-bold text-theme-text block mb-1">Alamat Fasilitas Kandang</label>
            <textarea
              rows={2}
              required
              placeholder="Alamat lengkap lokasi kandang penjemputan ternak..."
              value={farmAddress}
              onChange={(e) => setFarmAddress(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-xs text-theme-text"
            />
          </div>

          <div>
            <label className="font-bold text-theme-text block mb-1">
              Link Google Maps Lokasi Kandang (contoh: https://maps.app.goo.gl/xxxx)
            </label>
            <input
              type="text"
              placeholder="https://maps.app.goo.gl/..."
              onChange={(e) => {
                const url = e.target.value;
                const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match) {
                  setLatitude(parseFloat(match[1] || match[3]));
                  setLongitude(parseFloat(match[2] || match[4]));
                }
              }}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-3.5 py-2 text-xs text-theme-text"
            />
            <p className="text-[10px] text-theme-muted mt-1">
              Titik armada: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-theme-border">
            <div>
              <label className="font-bold text-theme-text block mb-1">Nomor Induk Berusaha (NIB / SKU)</label>
              <input
                type="text"
                placeholder="Contoh: NIB-9120304859218"
                value={nibSkuNumber}
                onChange={(e) => setNibSkuNumber(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
              />
            </div>

            <div>
              <label className="font-bold text-theme-text block mb-1">Foto Fasilitas Kandang (Maks 5 MB)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="w-full text-xs text-theme-text file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-theme-primary file:text-white"
              />
              {uploading && <p className="text-[10px] text-theme-primary font-bold mt-1">Mengunggah foto...</p>}
            </div>
          </div>

          <div className="pt-2 border-t border-theme-border space-y-3">
            <h3 className="font-bold text-xs text-theme-text uppercase tracking-wider text-theme-primary">
              Rekening Bank Pencairan Hasil Penjualan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-theme-muted block mb-1">Nama Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                >
                  <option value="BCA">BCA</option>
                  <option value="MANDIRI">MANDIRI</option>
                  <option value="BRI">BRI</option>
                  <option value="BNI">BNI</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-theme-muted block mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="8830192841"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-theme-muted block mb-1">Atas Nama Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="Sesuai buku tabungan"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all shadow-theme-primary/30"
            >
              {submitting ? 'Mengajukan Pendaftaran...' : 'Ajukan Pendaftaran Kandang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
