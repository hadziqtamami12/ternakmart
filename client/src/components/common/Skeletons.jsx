// Skeletons.jsx - 1:1 Layout-Matched Pulse Skeleton Loaders
import React from 'react';

export function LivestockCardSkeleton() {
  return (
    <div className="bg-theme-card border border-theme-border rounded-2xl overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
      {/* Photo Thumbnail Skeleton */}
      <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 relative">
        <div className="absolute top-3 left-3 h-6 w-20 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        <div className="absolute top-3 right-3 h-6 w-14 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Farm store name */}
          <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
          {/* Title */}
          <div className="h-5 w-5/6 bg-slate-300 dark:bg-slate-700 rounded mb-1.5"></div>
          <div className="h-4 w-3/5 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>

        {/* Specs Pill */}
        <div className="grid grid-cols-2 gap-2 py-2 border-y border-theme-border/60">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded mb-1"></div>
            <div className="h-6 w-28 bg-slate-300 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bg-theme-card border border-theme-border rounded-2xl p-4 flex gap-4">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-xl flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-6 w-36 bg-slate-300 dark:bg-slate-700 rounded mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-theme-card border border-theme-border rounded-2xl p-6 space-y-4">
          <div className="h-6 w-48 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
        <div className="bg-theme-card border border-theme-border rounded-2xl p-6 space-y-4">
          <div className="h-6 w-40 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
      <div className="bg-theme-card border border-theme-border rounded-2xl p-6 space-y-4 h-fit">
        <div className="h-6 w-36 bg-slate-300 dark:bg-slate-700 rounded"></div>
        <div className="space-y-2.5 pt-2">
          <div className="flex justify-between"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div></div>
          <div className="flex justify-between"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div></div>
          <div className="flex justify-between"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div></div>
          <div className="h-px bg-theme-border my-2"></div>
          <div className="flex justify-between"><div className="h-5 w-24 bg-slate-300 dark:bg-slate-700 rounded"></div><div className="h-6 w-28 bg-slate-300 dark:bg-slate-700 rounded"></div></div>
        </div>
        <div className="h-11 w-full bg-slate-300 dark:bg-slate-700 rounded-xl mt-4"></div>
      </div>
    </div>
  );
}

export function TrackingMapSkeleton() {
  return (
    <div className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-sm animate-pulse">
      {/* Viewport Map Skeleton */}
      <div className="w-full h-80 bg-slate-200 dark:bg-slate-800 relative flex items-center justify-center">
        <div className="h-10 w-44 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
      </div>

      {/* Driver Info & Timeline Skeleton */}
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800"></div>
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-slate-300 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>

        {/* Timeline checkpoints */}
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 mt-1"></div>
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-1/2 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="h-3.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-theme-card border border-theme-border rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="p-4 border-b border-theme-border flex justify-between">
        <div className="h-6 w-48 bg-slate-300 dark:bg-slate-700 rounded"></div>
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
      <div className="divide-y divide-theme-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-700 rounded"></div>
              <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-8 w-24 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 1:1 Layout-Matched Landing Page Skeleton for Theme Loading & Live Preview
export function LandingPageSkeleton({ viewMode = 'desktop' }) {
  const isMobile = viewMode === 'mobile';

  return (
    <div className="w-full h-full bg-theme-bg overflow-y-auto select-none animate-pulse flex flex-col font-sans">
      {/* 1. Header Navigation Skeleton */}
      {isMobile ? (
        <div className="sticky top-0 z-30 bg-theme-card border-b border-theme-border px-4 py-3 flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-300 dark:bg-slate-700" />
              <div className="h-5 w-24 bg-slate-300 dark:bg-slate-700 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="w-full h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center px-3">
            <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 mr-2" />
            <div className="h-3 w-36 bg-slate-300 dark:bg-slate-700 rounded" />
          </div>
        </div>
      ) : (
        <div className="sticky top-0 z-30 bg-theme-card/95 border-b border-theme-border px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-300 dark:bg-slate-700" />
            <div className="h-6 w-28 bg-slate-300 dark:bg-slate-700 rounded-lg" />
          </div>
          <div className="w-80 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center px-3.5">
            <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 mr-2" />
            <div className="h-3.5 w-44 bg-slate-300 dark:bg-slate-700 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-24 rounded-xl bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      )}

      {/* 2. Hero Section Skeleton */}
      <div className={`relative w-full bg-slate-900 overflow-hidden flex flex-col justify-center ${isMobile ? 'min-h-[300px] p-5' : 'min-h-[360px] p-8 sm:p-12'}`}>
        <div className="max-w-xl space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-32 rounded-full bg-slate-700/90" />
            <div className="h-5 w-24 rounded-full bg-slate-700/60" />
          </div>
          <div className="space-y-2">
            <div className="h-7 sm:h-10 w-4/5 rounded-xl bg-slate-600/80" />
            <div className="h-7 sm:h-10 w-3/5 rounded-xl bg-slate-600/70" />
          </div>
          <div className="h-4 w-5/6 rounded bg-slate-700/70" />
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-36 rounded-2xl bg-slate-500/80" />
            <div className="h-10 w-28 rounded-2xl bg-slate-700/60" />
          </div>
        </div>
      </div>

      {/* 3. Quick Categories Skeleton */}
      <div className="px-4 sm:px-8 py-5 border-b border-theme-border/60 bg-theme-card">
        <div className="flex items-center justify-between gap-3 overflow-x-hidden">
          {[1, 2, 3, 4, 5, 6].slice(0, isMobile ? 4 : 6).map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-12 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Products / Flash Sale Cards Grid Skeleton */}
      <div className="p-4 sm:p-8 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 bg-slate-300 dark:bg-slate-700 rounded" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>

        <div className={`grid gap-3.5 sm:gap-5 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
          {[1, 2, 3, 4].slice(0, isMobile ? 2 : 4).map((i) => (
            <LivestockCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* 5. Mobile Floating Bottom Dock Skeleton */}
      {isMobile && (
        <div className="sticky bottom-0 left-0 right-0 z-40 bg-theme-card border-t border-theme-border px-3 py-2 flex items-center justify-around shadow-lg">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="w-8 h-2 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
