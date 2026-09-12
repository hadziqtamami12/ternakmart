// ManageLivestockPage.jsx - Add/Edit Livestock with Strict 5MB Photo & 10MB Video Uploads
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Play,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useAppConfig } from '../../context/AppConfigContext';

export default function ManageLivestockPage({ onBack, onSaveSuccess }) {
  const { setDocumentTitle } = useAppConfig();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SAPI');
  const [breed, setBreed] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [ageMonths, setAgeMonths] = useState('24');
  const [gender, setGender] = useState('JANTAN');
  const [teethPoel, setTeethPoel] = useState('POEL_1');
  const [vaccinationStatus, setVaccinationStatus] = useState('Lengkap (PMK 1, PMK 2, Booster)');
  const [price, setPrice] = useState('');
  const [isQurbanEligible, setIsQurbanEligible] = useState(true);

  // Media files & uploads
  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [skkhUrl, setSkkhUrl] = useState('');

  const [uploadError, setUploadError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingSkkh, setUploadingSkkh] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDocumentTitle('Tambah Hewan Ternak');
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    // Client-side Validation: Max 5 MB, Image types
    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar (JPG, PNG, WEBP) yang diizinkan untuk foto ternak.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File foto melebihi limit 5 MB. Terdeteksi: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    setUploadingImage(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.data?.url) {
        setImages(prev => [...prev, res.data.url]);
      }
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah foto ternak.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    // Client-side Validation: Max 10 MB, Video types
    const allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedVideo.includes(file.type)) {
      setUploadError('Hanya format video MP4, WEBM, atau QuickTime yang diizinkan.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`File video melebihi limit 10 MB. Terdeteksi: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    setUploadingVideo(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.data?.url) {
        setVideoUrl(res.data.url);
      }
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah video ternak.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSkkhUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`Berkas SKKH melebihi limit 5 MB. Terdeteksi: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    setUploadingSkkh(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.data?.url) {
        setSkkhUrl(res.data.url);
      }
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah dokumen SKKH.');
    } finally {
      setUploadingSkkh(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !breed || !weightKg || !price) {
      alert('Mohon lengkapi judul, ras, bobot riil kg, dan harga ternak.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        category,
        breed,
        weight_kg: parseFloat(weightKg),
        age_months: parseInt(ageMonths, 10),
        gender,
        teeth_poel: teethPoel,
        vaccination_status: vaccinationStatus,
        skkh_certificate_url: skkhUrl,
        price: parseFloat(price),
        is_qurban_eligible: isQurbanEligible,
        images: images.length > 0 ? images : [
          'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80'
        ],
        video_url: videoUrl
      };

      const res = await api.post('/animals', payload);
      if (res.success) {
        alert('Hewan ternak berhasil ditambahkan ke katalog!');
        if (onSaveSuccess) onSaveSuccess();
        else onBack();
      }
    } catch (err) {
      alert(err.message || 'Gagal menyimpan data ternak.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </button>

      <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-theme-border pb-4">
          <h1 className="text-2xl font-extrabold text-theme-text">Tambah Hewan Ternak Baru</h1>
          <p className="text-xs text-theme-muted mt-0.5">
            Lengkapi data fisik, bobot riil, berkas sertifikasi SKKH dinas peternakan, serta video dokumentasi
          </p>
        </div>

        {uploadError && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Main Info */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-theme-primary">Informasi Utama</h2>
            <div>
              <label className="font-bold text-theme-text block mb-1">Judul / Nama Ternak</label>
              <input
                type="text"
                required
                placeholder="Contoh: Sapi Limosin Super Jumbo 850kg (Si Bima)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-theme-bg border border-theme-border rounded-2xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-theme-text block mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-semibold"
                >
                  <option value="SAPI">Sapi</option>
                  <option value="DOMBA">Domba</option>
                  <option value="KAMBING">Kambing</option>
                  <option value="KERBAU">Kerbau</option>
                  <option value="UNGGAS">Unggas</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Ras / Breed</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Limosin Cross"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Bobot Riil (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="850.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-theme-text block mb-1">Usia (Bulan)</label>
                <input
                  type="number"
                  required
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Gigi Poel</label>
                <select
                  value={teethPoel}
                  onChange={(e) => setTeethPoel(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                >
                  <option value="BELUM_POEL">Belum Poel</option>
                  <option value="POEL_1">Poel 1 Pasang (Cukup Umur)</option>
                  <option value="POEL_2">Poel 2 Pasang</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-theme-text block mb-1">Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-text"
                >
                  <option value="JANTAN">Jantan</option>
                  <option value="BETINA">Betina</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-bold text-theme-text block mb-1">Harga Jual Resmi (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="48500000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-2xl px-4 py-2.5 text-xs text-theme-text font-bold text-theme-primary"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-theme-text">
                  <input
                    type="checkbox"
                    checked={isQurbanEligible}
                    onChange={(e) => setIsQurbanEligible(e.target.checked)}
                    className="w-4 h-4 rounded text-theme-primary focus:ring-theme-primary"
                  />
                  <span>Memenuhi Syarat Sah Ibadah Qurban</span>
                </label>
              </div>
            </div>
          </div>

          {/* Media & SKKH Upload Section */}
          <div className="pt-4 border-t border-theme-border space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-theme-primary">
              Dokumentasi Foto, Video & Sertifikasi SKKH
            </h2>

            {/* Photo Upload */}
            <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-theme-text block">Foto Hewan Ternak (Maks 5 MB per foto)</label>
                <span className="text-[10px] text-theme-muted">{images.length} Foto terunggah</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={uploadingImage}
                className="w-full text-xs text-theme-text file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-theme-primary file:text-white file:font-bold"
              />
              {uploadingImage && <p className="text-[11px] text-theme-primary font-bold">Mengunggah foto...</p>}
            </div>

            {/* Video Upload */}
            <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-theme-text block flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-theme-primary" /> Video Singkat Fisik Ternak (Maks 10 MB - MP4, WEBM)
                </label>
                {videoUrl && <span className="text-[10px] text-emerald-600 font-bold">✓ Video Tersimpan</span>}
              </div>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoUpload}
                disabled={uploadingVideo}
                className="w-full text-xs text-theme-text file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-theme-primary file:text-white file:font-bold"
              />
              {uploadingVideo && <p className="text-[11px] text-theme-primary font-bold">Mengunggah video...</p>}
            </div>

            {/* SKKH Certificate Upload */}
            <div className="p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-theme-text block flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" /> Berkas SKKH / Surat Sehat Karantina (Maks 5 MB)
                </label>
                {skkhUrl && <span className="text-[10px] text-emerald-600 font-bold">✓ Berkas SKKH Diunggah</span>}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleSkkhUpload}
                disabled={uploadingSkkh}
                className="w-full text-xs text-theme-text file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-bold"
              />
              {uploadingSkkh && <p className="text-[11px] text-emerald-600 font-bold">Mengunggah dokumen SKKH...</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all shadow-theme-primary/30"
          >
            {submitting ? 'Menyimpan Ternak ke Katalog...' : 'Simpan & Tayangkan ke Katalog'}
          </button>
        </form>
      </div>
    </div>
  );
}
