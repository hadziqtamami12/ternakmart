import React, { useState, useRef, useEffect } from 'react';
import { Bell, Volume2, CheckCheck, Clock } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useTimezone } from '../../context/TimezoneContext';
import { useAuth } from '../../context/AuthContext';

export default function NotificationDropdown() {
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerTestDing
  } = useNotification();
  const { formatTime } = useTimezone();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!isAuthenticated) return null;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => {
      const next = !prev;
      if (next && unreadCount > 0) {
        markAllAsRead();
      }
      return next;
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        aria-label="Notifikasi"
        className="relative p-2.5 rounded-xl bg-theme-bg border border-theme-border text-theme-text hover:bg-theme-border/50 transition-colors flex items-center justify-center"
      >
        <Bell className="w-5 h-5 text-theme-text" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-theme-card animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-20px)] bg-theme-card border border-theme-border rounded-2xl shadow-elevated z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-theme-border flex items-center justify-between bg-theme-bg/60">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-theme-primary" />
              <h3 className="text-sm font-bold">Pemberitahuan Real-Time</h3>
              {unreadCount > 0 && (
                <span className="bg-theme-primary-light text-theme-primary text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={triggerTestDing}
                title="Bunyikan tes suara 'ding'"
                className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-card transition-colors text-xs flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Tes Ding</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Tandai semua telah dibaca"
                  className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-card transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-theme-border/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-theme-muted text-xs">
                Belum ada notifikasi baru saat ini.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 text-xs transition-colors cursor-pointer flex gap-3 ${
                    !notif.is_read ? 'bg-theme-primary-light/40 hover:bg-theme-primary-light/60' : 'hover:bg-theme-bg'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${!notif.is_read ? 'bg-theme-primary ring-2 ring-theme-primary/30' : 'bg-transparent'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold leading-tight ${!notif.is_read ? 'text-theme-text' : 'text-theme-muted'}`}>
                      {notif.title}
                    </p>
                    <p className="text-theme-text/80 mt-1 leading-relaxed text-[11px]">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-theme-muted mt-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(notif.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
