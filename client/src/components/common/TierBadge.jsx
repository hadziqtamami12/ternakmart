// TierBadge.jsx - Elegant Tier Badge Component for Users & Breeders
import React from 'react';
import { Award, Shield, Sparkles, Star, Crown } from 'lucide-react';

const ICON_MAP = {
  Award,
  Shield,
  Sparkles,
  Star,
  Crown
};

export default function TierBadge({ badge, size = 'md', showDescription = false }) {
  if (!badge) {
    badge = {
      name: 'Silver',
      slug: 'silver',
      icon_name: 'Shield',
      badge_color: '#94a3b8',
      min_successful_orders: 0
    };
  }

  // Strip 'Member' word from name as requested (e.g. 'Silver Member' -> 'Silver')
  const cleanName = (badge.name || 'Silver').replace(/\s*Member/gi, '').trim();

  const IconComponent = ICON_MAP[badge.icon_name] || Award;
  const isPlatinum = badge.slug?.includes('platinum') || badge.badge_color?.includes('06b6d4');
  const isGold = badge.slug?.includes('gold') || badge.badge_color?.includes('eab308');

  // Aesthetic gradations
  const badgeStyles = isPlatinum
    ? 'bg-gradient-to-r from-cyan-500/15 via-teal-500/15 to-emerald-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-cyan-500/10'
    : isGold
    ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-orange-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400 shadow-amber-500/10'
    : 'bg-gradient-to-r from-slate-500/10 to-gray-500/10 border-slate-400/30 text-slate-700 dark:text-slate-300 shadow-sm';

  const iconColor = isPlatinum
    ? 'text-cyan-500 animate-pulse'
    : isGold
    ? 'text-amber-500'
    : 'text-slate-400';

  const sizeClasses = {
    xs: 'text-[9px] px-2 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  }[size] || 'text-xs px-3 py-1 gap-1.5';

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div
        className={`inline-flex items-center rounded-full font-black uppercase tracking-wider border shadow-sm backdrop-blur-md ${badgeStyles} ${sizeClasses}`}
      >
        <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 ${iconColor}`} />
        <span>{cleanName}</span>
      </div>

      {showDescription && (
        <span className="text-[10px] text-theme-muted">
          Min. {badge.min_successful_orders || 0} order sukses • Omset Rp {(Number(badge.min_turnover_idr || 0) / 1000000).toFixed(0)} Juta
        </span>
      )}
    </div>
  );
}
