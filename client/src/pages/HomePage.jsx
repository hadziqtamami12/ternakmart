// HomePage.jsx - Modern E-Commerce Marketplace Landing Page
import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Play,
  Flame,
  Clock,
  ShoppingBag,
  Star,
  MapPin,
  Tag,
  ThumbsUp,
  Percent,
  Check,
  ChevronLeft,
  ChevronDown,
  Search,
  Phone,
  Mail,
  Headphones,
  CreditCard,
  Shield
} from 'lucide-react';
import { api } from '../utils/api';
import { formatRupiah, formatWeight } from '../utils/formatters';
import { LivestockCardSkeleton } from '../components/common/Skeletons';
import { useAppConfig } from '../context/AppConfigContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';
import PromoEventModal from '../components/common/PromoEventModal';

export default function HomePage({ onNavigate, onSelectAnimal }) {
  const { config, setDocumentTitle } = useAppConfig();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [stores, setStores] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [bannerIndex, setBannerIndex] = useState(0);
  const [heroBanners, setHeroBanners] = useState([]);

  // Flash sale countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  // Searchable dropdown category filter state
  const [dropdownCategory, setDropdownCategory] = useState('ALL');
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Touch & Mouse Drag Slider state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setDocumentTitle('Platform E-Commerce Peternakan Terpercaya');
    fetchHomeData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dropdown click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  // Auto banner rotation (every 5.5 seconds with smooth crossfade)
  useEffect(() => {
    const count = heroBanners.length > 0 ? heroBanners.length : 3;
    const bannerTimer = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % count);
    }, 5500);
    return () => clearInterval(bannerTimer);
  }, [heroBanners.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setBannerIndex(prev => (prev + 1) % 3);
      } else {
        setBannerIndex(prev => (prev - 1 + 3) % 3);
      }
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    // track move
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setBannerIndex(prev => (prev + 1) % 3);
      } else {
        setBannerIndex(prev => (prev - 1 + 3) % 3);
      }
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [animalsRes, storesRes, reviewsRes, heroRes] = await Promise.all([
        api.get('/animals?limit=12').catch(() => ({ success: false, data: [] })),
        api.get('/stores').catch(() => ({ success: false, data: [] })),
        api.get('/reviews').catch(() => ({ success: false, data: [] })),
        api.get('/hero-banners').catch(() => ({ success: false, data: [] }))
      ]);

      if (animalsRes && animalsRes.success && animalsRes.data) {
        setAnimals(animalsRes.data);
      }
      if (storesRes && storesRes.success && storesRes.data) {
        setStores(storesRes.data);
      }
      if (reviewsRes && reviewsRes.success && reviewsRes.data) {
        setReviews(reviewsRes.data);
      }
      if (heroRes && heroRes.success && Array.isArray(heroRes.data) && heroRes.data.length > 0) {
        setHeroBanners(heroRes.data.filter(b => b.is_active !== false));
      }
    } catch (err) {
      console.warn('Could not load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddToCart = async (e, animal) => {
    e.stopPropagation();
    await addToCart(animal);
  };

  const defaultBanners = [
    {
      id: 1,
      badge: config.hero_badge || 'FESTIVAL AKBAR QURBAN 1447H',
      title: config.hero_title || 'Diskon Spesial Ternak Hingga Rp 1.500.000',
      subtitle: config.hero_subtitle || 'Free Titip Rawat & Pakan Konsentrat sampai H-3 Idul Adha. Bebas Ongkir Armada Khusus Jabodetabek & Bandung.',
      cta: config.hero_cta || 'Beli Ternak Qurban',
      tag: 'Kupon: QURBANBERKAH',
      categoryBadge: '🐂 SAPI & DOMBA SUPER',
      category: 'SAPI',
      image: config.hero_banner_image || 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1920&auto=format&fit=crop&q=85'
    },
    {
      id: 2,
      badge: 'LOGISTIK ARMADA MANDIRI',
      title: 'Truk Pengantar Ber-AC & Checkpoint Pakan',
      subtitle: 'Pantau posisi GPS truk secara langsung ala Gojek. Hewan dipastikan rileks, diberi pakan & air minum di rest stop perjalanan.',
      cta: 'Lacak & Beli Ternak',
      tag: 'Live GPS Tracking',
      categoryBadge: '🚚 ARMADA KHUSUS',
      category: 'KAMBING',
      image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&auto=format&fit=crop&q=85'
    },
    {
      id: 3,
      badge: 'JAMINAN 100% RESMI',
      title: 'Sertifikat SKKH & Bebas Penyakit PMK',
      subtitle: 'Seluruh hewan lolos uji laboratorium karantina dinas peternakan. Garansi timbangan bobot riil 100% akurat.',
      cta: 'Cek Hewan Ber-SKKH',
      tag: 'Terverifikasi Dinas',
      categoryBadge: '✅ SKKH VERIFIED',
      category: 'DOMBA',
      image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1920&auto=format&fit=crop&q=85'
    }
  ];

  const promoBanners = heroBanners.length > 0 ? heroBanners : defaultBanners;

  const quickCategories = [
    { id: 'SAPI', name: 'Sapi Qurban', icon: '🐂', color: 'bg-emerald-500/10 text-emerald-600' },
    { id: 'DOMBA', name: 'Domba Garut', icon: '🐑', color: 'bg-amber-500/10 text-amber-600' },
    { id: 'KAMBING', name: 'Kambing Etawa', icon: '🐐', color: 'bg-purple-500/10 text-purple-600' },
    { id: 'KERBAU', name: 'Kerbau Rawa', icon: '🐃', color: 'bg-stone-500/10 text-stone-600' },
    { id: 'AQIQAH', name: 'Paket Aqiqah', icon: '🍲', color: 'bg-rose-500/10 text-rose-600' },
    { id: 'PAKAN', name: 'Pakan & Vitamin', icon: '🌿', color: 'bg-lime-500/10 text-lime-600' }
  ];

  // Category options for dropdown search
  const categoryOptions = [
    { id: 'ALL', label: 'Semua Kategori Ternak', count: animals.length },
    { id: 'SAPI', label: 'Sapi (Simental, Limosin, Bali, Madura)', count: animals.filter(a => a.category === 'SAPI').length },
    { id: 'DOMBA', label: 'Domba (Garut, Texel, Merino, Dorper)', count: animals.filter(a => a.category === 'DOMBA').length },
    { id: 'KAMBING', label: 'Kambing (Etawa, Boer, Kacang, Jawarandu)', count: animals.filter(a => a.category === 'KAMBING').length },
    { id: 'KERBAU', label: 'Kerbau (Rawa, Murrah, Toraja)', count: animals.filter(a => a.category === 'KERBAU').length },
    { id: 'QURBAN', label: 'Khusus Syarat Sah Qurban 1447H', count: animals.filter(a => a.is_qurban_eligible).length },
    { id: 'HEMAT', label: 'Harga Hemat (< Rp 10 Juta)', count: animals.filter(a => a.price < 10000000).length }
  ];

  // Filter animals based on active tab & dropdown category
  const filteredAnimals = animals.filter(a => {
    if (dropdownCategory !== 'ALL') {
      if (dropdownCategory === 'QURBAN') {
        if (!a.is_qurban_eligible) return false;
      } else if (dropdownCategory === 'HEMAT') {
        if (a.price >= 10000000) return false;
      } else {
        if (a.category !== dropdownCategory) return false;
      }
    }
    if (activeTab === 'QURBAN') return a.is_qurban_eligible;
    if (activeTab === 'SAPI') return a.category === 'SAPI';
    if (activeTab === 'DOMBA') return a.category === 'DOMBA' || a.category === 'KAMBING';
    if (activeTab === 'HEMAT') return a.price < 10000000;
    return true;
  });

  const promoAnimalIds = Array.isArray(config.promo_animal_ids) ? config.promo_animal_ids : [];
  const promoDiscount = Number(config.promo_discount_percent) || 10;

  const flashSaleAnimals = promoAnimalIds.length > 0
    ? animals.filter(a => promoAnimalIds.includes(a.id))
    : animals.slice(0, 4);

  const activeCategoryLabel = categoryOptions.find(c => c.id === dropdownCategory)?.label || 'Pilih Kategori';

  return (
    <div className="space-y-8 sm:space-y-12 overflow-x-hidden w-full max-w-full">

      {/* 1. Full-Bleed Adaptive Hero Slider (Desktop: 100dvh, Mobile: 88dvh/90dvh with Peek Indicator) */}
      <section className="relative w-full overflow-hidden select-none -mt-0">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="relative w-full min-h-[100dvh] sm:min-h-[90dvh] lg:min-h-screen flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        >
          {/* Background Slides with Crossfade & Ken-Burns Zoom Animation */}
          {promoBanners.map((banner, index) => {
            const isActive = bannerIndex === index;
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
              >
                {/* Background Image with subtle zoom / scale transition */}
                <div
                  className={`w-full h-full bg-cover bg-center transition-transform duration-[6000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'
                    }`}
                  style={{ backgroundImage: `url(${banner.image})` }}
                />

                {/* Dark Contrast Scrim & Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/75" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
              </div>
            );
          })}

          {/* Active Banner Foreground Content */}
          <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20 flex flex-col justify-center min-h-[100dvh] sm:min-h-[90dvh] lg:min-h-screen">
            <div className="max-w-2xl space-y-4 sm:space-y-6">
              {/* Category & Verified Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {promoBanners[bannerIndex].badge}
                </span>

                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  {promoBanners[bannerIndex].categoryBadge}
                </span>

                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/25 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-bold tracking-wider backdrop-blur-md shadow-sm">
                  <Tag className="w-3 h-3 mr-1 text-amber-400" />
                  {promoBanners[bannerIndex].tag}
                </span>
              </div>

              {/* High Contrast Heading */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] drop-shadow-md">
                {promoBanners[bannerIndex].title}
              </h1>

              {/* Subtitle / Description */}
              <p className="text-xs sm:text-base text-slate-200 leading-relaxed max-w-xl line-clamp-3 sm:line-clamp-none drop-shadow">
                {promoBanners[bannerIndex].subtitle}
              </p>

              {/* Dual CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-4">
                <button
                  onClick={() => onNavigate('catalog', { category: promoBanners[bannerIndex].category })}
                  className="px-6 py-3.5 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-theme-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>{promoBanners[bannerIndex].cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('catalog')}
                  className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>Jelajahi Semua Hewan</span>
                  <ChevronRight className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>
          </div>

          {/* Left & Right Desktop Arrow Navigation Buttons */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBannerIndex(prev => (prev - 1 + promoBanners.length) % promoBanners.length);
            }}
            className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white items-center justify-center border border-white/20 backdrop-blur-md z-30 transition-all hover:scale-110 shadow-lg"
            aria-label="Slide Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBannerIndex(prev => (prev + 1) % promoBanners.length);
            }}
            className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white items-center justify-center border border-white/20 backdrop-blur-md z-30 transition-all hover:scale-110 shadow-lg"
            aria-label="Slide Berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Banner Navigation Dots (Bottom Center/Right) */}
          <div className="absolute bottom-5 sm:bottom-10 inset-x-0 mx-auto w-fit sm:inset-x-auto sm:right-10 flex items-center gap-2.5 z-30 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
            {promoBanners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBannerIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${bannerIndex === i ? 'w-7 bg-theme-primary shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Buka slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Mobile Peek Indicator Arrow at Bottom (True Centered on Viewport) */}
          <div className="sm:hidden absolute bottom-16 inset-x-0 flex items-center justify-center pointer-events-none z-20">
            <div className="flex flex-col items-center gap-0.5 text-white/90 animate-bounce">
              <span className="text-[10px] font-black tracking-widest uppercase text-white drop-shadow-md bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/20">Scroll</span>
              <ChevronDown className="w-4 h-4 text-white drop-shadow-md" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Category Circular Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickCategories.map((qc) => (
            <div
              key={qc.id}
              onClick={() => onNavigate('catalog', { category: qc.id === 'AQIQAH' || qc.id === 'PAKAN' ? '' : qc.id })}
              className="p-3 sm:p-4 rounded-2xl bg-theme-card border border-theme-border hover:border-theme-primary/50 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-theme-bg flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                {qc.icon}
              </div>
              <span className="text-xs font-bold text-theme-text group-hover:text-theme-primary transition-colors">
                {qc.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale / Promo Kilat Bertempo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-xl space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-white/20 backdrop-blur-md flex-shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight">PROMO KILAT HARI INI</h2>
                  <span className="bg-white/20 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Diskon {promoDiscount}%
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Penawaran spesial diskon {promoDiscount}% langsung dari peternak terverifikasi:
                </p>
              </div>
            </div>

            {/* Countdown timer blocks */}
            <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto">
              <div className="bg-black/40 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm text-center min-w-[42px]">
                {String(timeLeft.hours).padStart(2, '0')}
                <span className="text-[8px] sm:text-[9px] block font-sans font-normal opacity-70">Jam</span>
              </div>
              <span className="font-bold text-xs sm:text-sm">:</span>
              <div className="bg-black/40 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm text-center min-w-[42px]">
                {String(timeLeft.minutes).padStart(2, '0')}
                <span className="text-[8px] sm:text-[9px] block font-sans font-normal opacity-70">Mnt</span>
              </div>
              <span className="font-bold text-xs sm:text-sm">:</span>
              <div className="bg-black/40 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm text-center min-w-[42px]">
                {String(timeLeft.seconds).padStart(2, '0')}
                <span className="text-[8px] sm:text-[9px] block font-sans font-normal opacity-70">Dtk</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {flashSaleAnimals.map((animal) => {
              const discountedPrice = Math.round(animal.price * (1 - promoDiscount / 100));
              return (
                <div
                  key={animal.id}
                  onClick={() => onSelectAnimal(animal)}
                  className="bg-theme-card rounded-2xl overflow-hidden text-theme-text cursor-pointer hover:shadow-2xl transition-all flex flex-col justify-between group border border-theme-border"
                >
                  <div className="relative w-full aspect-[4/3] bg-theme-bg overflow-hidden flex-shrink-0">
                    <img
                      src={animal.images[0]}
                      alt={animal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-1.5 sm:px-2 py-0.5 rounded-md bg-red-600 text-white text-[9px] sm:text-[10px] font-black shadow-md">
                      HEMAT {promoDiscount}%
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs line-clamp-1 group-hover:text-theme-primary transition-colors">
                        {animal.title}
                      </h4>
                      <p className="text-[10px] text-theme-muted truncate">{formatWeight(animal.weight_kg)} • {animal.breed}</p>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-theme-muted line-through truncate">
                        {formatRupiah(animal.price)}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-red-600 dark:text-red-400 truncate">
                        {formatRupiah(discountedPrice)}
                      </div>
                    </div>

                    {/* Stock status bar */}
                    <div className="space-y-0.5 pt-0.5">
                      <div className="w-full bg-theme-bg h-1.5 rounded-full overflow-hidden border border-theme-border/40">
                        <div className="bg-red-500 h-full w-3/4 rounded-full" />
                      </div>
                      <span className="text-[9px] font-bold text-red-600 block text-right">
                        Tersisa 2 ekor
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleQuickAddToCart(e, animal)}
                      className="w-full py-1.5 sm:py-2 rounded-xl bg-theme-primary text-white text-[10px] sm:text-[11px] font-bold hover:bg-theme-primary-hover flex items-center justify-center gap-1 sm:gap-1.5 transition-colors shadow-sm mt-1"
                    >
                      <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> + Keranjang
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Official Kandang Peternak Terverifikasi (Store Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-theme-text flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Kandang & Sentra Peternakan Resmi
            </h2>
            <p className="text-xs text-theme-muted">Peternak bersertifikasi NIB dengan fasilitas pemeliharaan standar dinas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stores.map((s) => (
            <div
              key={s.id}
              onClick={() => onNavigate('catalog')}
              className="bg-theme-card border border-theme-border rounded-3xl p-5 shadow-sm hover:border-theme-primary/50 cursor-pointer transition-all flex items-center gap-4 group"
            >
              <img
                src={s.farm_photo_url}
                alt={s.store_name}
                className="w-20 h-20 rounded-2xl object-cover border border-theme-border flex-shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-theme-text truncate group-hover:text-theme-primary transition-colors">
                    {s.store_name}
                  </h3>
                  <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    Tier {s.tier}
                  </span>
                </div>
                <p className="text-xs text-theme-muted line-clamp-1">{s.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-theme-muted pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-theme-primary" /> {s.farm_address.split(',')[1] || s.farm_address}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    ★ {s.rating_average || 4.9} ({s.total_reviews || 30}+ ulasan)
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-theme-muted group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Main E-Commerce Product Grid with Searchable Dropdown & Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-theme-border pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight">Katalog Produk Ternak Pilihan</h2>
            <p className="text-xs text-theme-muted mt-0.5">Pesan langsung dari peternak, armada khusus siap antar ke alamat Anda</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            {/* Searchable Dropdown Filter */}
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full sm:w-64 px-3.5 py-2.5 rounded-2xl bg-theme-card border border-theme-border text-theme-text text-xs font-bold flex items-center justify-between shadow-sm hover:border-theme-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-theme-primary">🎯</span>
                  <span className="truncate">{activeCategoryLabel}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu with Live Search */}
              {isDropdownOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-72 bg-theme-card border border-theme-border rounded-2xl shadow-elevated z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Cari kategori/ras..."
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
                    />
                    <Search className="w-3.5 h-3.5 text-theme-muted absolute left-2.5 top-2" />
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-theme-border/40 pt-1">
                    {categoryOptions
                      .filter(opt => opt.label.toLowerCase().includes(dropdownSearch.toLowerCase()))
                      .map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setDropdownCategory(opt.id);
                            setIsDropdownOpen(false);
                            setDropdownSearch('');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${dropdownCategory === opt.id
                            ? 'bg-theme-primary-light text-theme-primary font-black'
                            : 'text-theme-text hover:bg-theme-bg'
                            }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          <span className="text-[10px] text-theme-muted ml-2">{opt.count}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'QURBAN', label: 'Sah Qurban' },
                { id: 'SAPI', label: 'Sapi' },
                { id: 'DOMBA', label: 'Kambing & Domba' },
                { id: 'HEMAT', label: 'Hemat' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                    ? 'bg-theme-primary text-white shadow-sm'
                    : 'bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <LivestockCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAnimals.map((animal) => (
              <div
                key={animal.id}
                onClick={() => onSelectAnimal(animal)}
                className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-theme-primary/40 cursor-pointer transition-all flex flex-col justify-between group"
              >
                {/* Photo Thumbnail */}
                <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={animal.images[0]}
                    alt={animal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                    {animal.category}
                  </span>

                  {/* SKKH Official Badge */}
                  {animal.skkh_verification_status && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3" /> SKKH Sah
                    </span>
                  )}

                  {/* Free Delivery Tag */}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-md text-slate-950 text-[9px] font-black">
                    BEBAS ONGKIR
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-theme-muted mb-1">
                      <span className="font-semibold text-theme-text truncate">{animal.store?.store_name || 'Barokah Farm'}</span>
                      <span>•</span>
                      <span>{animal.breed}</span>
                    </div>

                    <h3 className="font-bold text-sm text-theme-text line-clamp-2 group-hover:text-theme-primary transition-colors leading-snug">
                      {animal.title}
                    </h3>
                  </div>

                  {/* Key specs pill */}
                  <div className="grid grid-cols-2 gap-1.5 py-2 px-2.5 rounded-xl bg-theme-bg text-[11px]">
                    <div>
                      <span className="text-theme-muted text-[10px] block">Bobot:</span>
                      <span className="font-black text-theme-text">{formatWeight(animal.weight_kg)}</span>
                    </div>
                    <div>
                      <span className="text-theme-muted text-[10px] block">Gigi Poel:</span>
                      <span className="font-bold text-theme-text">{animal.teeth_poel.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Star rating & sold count */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <div className="flex text-amber-400">
                      {'★'.repeat(5)}
                    </div>
                    <span className="font-bold text-theme-text">4.9</span>
                    <span className="text-theme-muted">(24 terjual)</span>
                  </div>

                  {/* Price and Cart Button */}
                  <div className="pt-2 border-t border-theme-border/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-theme-muted block">Harga Resmi</span>
                      <div className="text-base font-black text-theme-primary">
                        {formatRupiah(animal.price)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleQuickAddToCart(e, animal)}
                      className="px-3.5 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm flex-shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>+ Keranjang</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Ulasan Pembeli & Rating Bintang (Verified Real-Time Reviews) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Star className="w-5 h-5 fill-amber-500" />
                </span>
                <h2 className="text-xl font-extrabold text-theme-text">
                  Ulasan Pembeli & Rating Bintang
                </h2>
              </div>
              <p className="text-xs text-theme-muted mt-1">
                Testimoni riil pelanggan atas akurasi timbangan bobot ternak, sertifikat SKKH, dan armada ber-AC
              </p>
            </div>

            <div className="flex items-center gap-3 bg-theme-bg px-4 py-2 rounded-2xl border border-theme-border self-start sm:self-auto">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <span className="text-sm font-black text-theme-text">5.0 / 5.0</span>
              <span className="text-xs text-theme-muted">({reviews.length || 3}+ Ulasan Terverifikasi)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(reviews.length > 0 ? reviews.slice(0, 6) : [
              {
                id: 'rev_default_1',
                user_name: 'Haji Sulaiman Effendi',
                comment: 'Alhamdulillah sapinya sangat sehat dan bugar. Timbangan digital 851 kg pas dan tim kurir Ternakmart ramah sekali.',
                rating: 5,
                weight_match_rating: 5,
                animal_title: 'Simental Super Jumbo 850kg',
                store_name: 'Sentra Sapi Barokah Farm'
              },
              {
                id: 'rev_default_2',
                user_name: 'Ibu Rahmawati',
                comment: 'Domba Garut tanduk indah, bulu bersih, dan surat SKKH dinas peternakan asli disertakan di amplop resmi.',
                rating: 5,
                weight_match_rating: 5,
                animal_title: 'Domba Garut Gagah Jawara',
                store_name: 'Kandang Domba Pasundan'
              },
              {
                id: 'rev_default_3',
                user_name: 'Bpk. Hendra Gunawan',
                comment: 'Live tracking armada kurir sangat membantu, bisa pantau posisi truk pengantar sampai tiba di masjid.',
                rating: 5,
                weight_match_rating: 5,
                animal_title: 'Kambing Etawa Super Perah',
                store_name: 'Peternakan Berkah Mandiri'
              }
            ]).map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-theme-bg border border-theme-border hover:border-theme-primary/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                    </span>
                  </div>

                  <p className="text-xs text-theme-text italic leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-theme-muted bg-theme-card p-2 rounded-xl border border-theme-border">
                    <span className="font-bold text-theme-primary">Kesesuaian Bobot:</span>
                    <span>{rev.weight_match_rating || 5}/5 (100% Akurat)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-theme-border/60">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {(rev.user_name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-theme-text block truncate">
                      {rev.user_name || 'Pembeli Terverifikasi'}
                    </span>
                    <span className="text-[10px] text-theme-muted truncate block">
                      {rev.animal_title || 'Ternak Terpilih'} • {rev.store_name || 'Kandang Peternak'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Benefit Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-theme-card border border-theme-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-lg font-extrabold text-theme-text text-center mb-8">
            Standar Kualitas & Perlindungan Belanja Ternakmart
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-theme-text">100% Bobot Timbangan Pas</h3>
              <p className="text-xs text-theme-muted">
                Timbangan digital terkalibrasi resmi. Selisih bobot pada saat serah terima bergaransi uang kembali.
              </p>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-theme-text">SKKH Sah Dinas Peternakan</h3>
              <p className="text-xs text-theme-muted">
                Bebas penyakit menular (PMK & Antraks), divaksin lengkap, dan lolos uji karantina kesehatan fisik.
              </p>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-theme-text">Armada Sirkulasi & Rest Stop</h3>
              <p className="text-xs text-theme-muted">
                Truk dilengkapi semprotan penyejuk udara dan checkpoint pakan konsentrat agar hewan bugar sampai tujuan.
              </p>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Tag className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-theme-text">Kalkulasi Transparan</h3>
              <p className="text-xs text-theme-muted">
                Rumus harga ternak, diskon toko, ongkir, subsidi platform, dan biaya layanan admin terbuka tanpa biaya liar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Homepage Special Event / Promo Modal Popup (Muncul otomatis saat aktif baik di mobile maupun desktop) */}
      <PromoEventModal
        config={config}
        onNavigate={onNavigate}
      />

      {/* Clean, Balanced Responsive Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
