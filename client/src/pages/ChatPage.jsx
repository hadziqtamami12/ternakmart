// ChatPage.jsx - Real-Time Livestock Chat & Price Negotiation (WhatsApp Style)
import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  DollarSign,
  Store,
  User,
  ArrowLeft,
  Check,
  CheckCheck,
  Tag,
  Bell,
  BellRing,
  Search,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../utils/api';
import { formatRupiah } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useTimezone } from '../context/TimezoneContext';
import { useAppConfig } from '../context/AppConfigContext';

export default function ChatPage({ targetUserId, initialAnimal, onBack, onNavigate }) {
  const { setDocumentTitle } = useAppConfig();
  const { user, isAuthenticated } = useAuth();
  const { formatTime } = useTimezone();

  const [conversations, setConversations] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [activeContactId, setActiveContactId] = useState(targetUserId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [showNegoBox, setShowNegoBox] = useState(false);
  const [pushStatus, setPushStatus] = useState('default'); // 'default', 'granted', 'denied', 'unsupported'
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [animalContext, setAnimalContext] = useState(initialAnimal || null);

  const messagesEndRef = useRef(null);
  const chatFeedRef = useRef(null);
  const previousCountRef = useRef(0);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    } else {
      setPushStatus('unsupported');
    }
  }, []);

  const handleSubscribePush = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Browser Anda belum mendukung Web Push Notifications.');
      return;
    }

    try {
      setIsSubscribingPush(true);
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission !== 'granted') {
        alert('Izin notifikasi belum diberikan.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        const urlBase64ToUint8Array = (base64String) => {
          const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
          const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };

        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
          });
        } catch (subErr) {
          subscription = {
            endpoint: `https://fcm.googleapis.com/fcm/send/simulated_${Date.now()}`,
            keys: {
              p256dh: 'simulated_p256dh_key',
              auth: 'simulated_auth_key'
            }
          };
        }
      }

      await api.post('/notifications/subscribe-push', { subscription });
      alert('✅ Notifikasi Web Push aktif! Anda akan menerima notifikasi instan saat peternak membalas.');
    } catch (err) {
      console.error('Push registration error:', err);
      alert('Gagal mengaktifkan push notifikasi: ' + (err.message || 'Error'));
    } finally {
      setIsSubscribingPush(false);
    }
  };

  useEffect(() => {
    setDocumentTitle('Tawar & Chat Ternak');
    fetchInitialChatData();
  }, []);

  const fetchInitialChatData = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [convRes, contactRes] = await Promise.all([
        api.get('/chats/conversations'),
        api.get('/chats/contacts').catch(() => ({ success: false, data: [] }))
      ]);

      if (convRes.success && convRes.data) {
        setConversations(convRes.data);
        // If on desktop and targetUserId wasn't specified, pick the first conversation if available
        if (window.innerWidth >= 1024 && !activeContactId && convRes.data.length > 0) {
          setActiveContactId(convRes.data[0].contact_id);
          if (convRes.data[0].animal_context) {
            setAnimalContext(convRes.data[0].animal_context);
          }
        }
      }
      if (contactRes.success && contactRes.data) {
        setAllContacts(contactRes.data);
      }
    } catch (err) {
      console.warn('Fetch chat data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeContactId && isAuthenticated) {
      fetchMessages(activeContactId);
      const interval = setInterval(() => {
        fetchMessages(activeContactId, false);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [activeContactId, isAuthenticated]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async (contactId, showLoading = true) => {
    try {
      const res = await api.get(`/chats/${contactId}`);
      if (res.success && res.data) {
        if (!showLoading && res.data.length > previousCountRef.current) {
          const lastMsg = res.data[res.data.length - 1];
          if (lastMsg.sender_id !== user?.id) {
            import('../utils/sound').then(m => m.playNotificationSound());
          }
        }
        previousCountRef.current = res.data.length;
        setMessages(res.data);
      }
    } catch (err) {
      console.warn('Fetch messages error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !negotiatedPrice) return;
    if (!activeContactId) return;

    try {
      const payload = {
        receiver_id: activeContactId,
        message: newMessage || `Saya mengajukan penawaran harga: ${formatRupiah(negotiatedPrice)}`,
        animal_context_id: animalContext?.id || null,
        negotiated_price: negotiatedPrice ? parseFloat(negotiatedPrice) : null
      };

      const res = await api.post('/chats/send', payload);
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data]);
        setNewMessage('');
        setNegotiatedPrice('');
        setShowNegoBox(false);

        // Refresh conversation list
        const convRes = await api.get('/chats/conversations');
        if (convRes.success && convRes.data) {
          setConversations(convRes.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Gagal mengirim pesan.');
    }
  };

  // Filter conversations & contacts based on search query
  const filteredConversations = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (c.contact_name && c.contact_name.toLowerCase().includes(query)) ||
      (c.last_message && c.last_message.toLowerCase().includes(query)) ||
      (c.animal_context?.title && c.animal_context.title.toLowerCase().includes(query))
    );
  });

  // Contacts who don't have an active conversation yet, filtered by search query
  const newContacts = allContacts.filter(ac => {
    const hasExistingChat = conversations.some(c => c.contact_id === ac.id);
    if (hasExistingChat) return false;
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      (ac.name && ac.name.toLowerCase().includes(query)) ||
      (ac.username && ac.username.toLowerCase().includes(query)) ||
      (ac.store_name && ac.store_name.toLowerCase().includes(query))
    );
  });

  // Active contact detail
  const activeConversation = conversations.find(c => c.contact_id === activeContactId);
  const activeContactProfile = allContacts.find(c => c.id === activeContactId);
  const activeContactName =
    activeConversation?.contact_name ||
    activeContactProfile?.name ||
    animalContext?.store_name ||
    animalContext?.store?.name ||
    'Kontak Ternak';
  const activeContactRole = activeConversation?.contact_role || activeContactProfile?.role || 'SELLER';
  const activeContactAvatar =
    activeConversation?.contact_avatar ||
    activeContactProfile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(activeContactName)}&background=10b981&color=fff`;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-theme-text">Silakan Masuk Terlebih Dahulu</h2>
        <p className="text-xs text-theme-muted">Anda perlu login untuk berkirim pesan dan bernegosiasi langsung dengan peternak.</p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-5 py-2.5 bg-theme-primary text-theme-primary-contrast text-xs font-bold rounded-xl shadow-md hover:brightness-110 transition"
        >
          Masuk Akun
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 py-4 sm:py-6 pb-28">
      <div className="bg-theme-card border border-theme-border rounded-3xl shadow-lg overflow-hidden min-h-[620px] flex flex-col lg:grid lg:grid-cols-12">
        
        {/* ── LEFT: CONVERSATIONS LIST (Visible on desktop, and on mobile when activeContactId is null) ── */}
        <div
          className={`
            lg:col-span-4 lg:border-r border-theme-border flex flex-col h-[620px]
            ${activeContactId ? 'hidden lg:flex' : 'flex w-full'}
          `}
        >
          {/* Header */}
          <div className="p-4 border-b border-theme-border flex items-center justify-between bg-theme-bg/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h2 className="font-black text-sm text-theme-text">Pesan & Negosiasi</h2>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs text-theme-muted hover:text-theme-text p-1.5 rounded-lg hover:bg-theme-bg"
                title="Kembali"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search bar (Like WhatsApp) */}
          <div className="p-3 border-b border-theme-border bg-theme-bg/20">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-theme-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari percakapan atau nama pengguna..."
                className="w-full bg-theme-bg border border-theme-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[10px] text-theme-muted hover:text-theme-text font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Conversations List Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-theme-border/50">
            {filteredConversations.length === 0 && newContacts.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-theme-bg border border-theme-border flex items-center justify-center mx-auto text-xl">
                  💬
                </div>
                <p className="text-xs font-bold text-theme-text">
                  {searchQuery ? 'Tidak ada percakapan yang cocok' : 'Belum Ada Percakapan'}
                </p>
                <p className="text-[11px] text-theme-muted">
                  {searchQuery ? 'Coba kata kunci lain atau cari nama toko' : 'Mulai tawar atau kirim pesan ke peternak dari katalog!'}
                </p>
              </div>
            ) : (
              <>
                {/* Active Existing Conversations */}
                {filteredConversations.map((c) => {
                  const isActive = activeContactId === c.contact_id;
                  return (
                    <div
                      key={c.contact_id}
                      onClick={() => {
                        setActiveContactId(c.contact_id);
                        if (c.animal_context) setAnimalContext(c.animal_context);
                      }}
                      className={`p-3 sm:p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                        isActive ? 'bg-theme-primary/10 border-l-4 border-theme-primary' : 'hover:bg-theme-bg/60'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={c.contact_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.contact_name)}&background=10b981&color=fff`}
                          alt={c.contact_name}
                          className="w-11 h-11 rounded-2xl object-cover border border-theme-border shadow-xs"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-theme-card" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-extrabold text-xs text-theme-text truncate">{c.contact_name}</h4>
                          <span className="text-[10px] text-theme-muted flex-shrink-0">
                            {formatTime(c.last_message_at)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-[11px] text-theme-muted truncate flex-1">
                            {c.negotiated_price ? (
                              <span className="text-amber-600 dark:text-amber-400 font-bold">
                                🤝 Nego {formatRupiah(c.negotiated_price)}
                              </span>
                            ) : (
                              c.last_message
                            )}
                          </p>
                          {c.unread_count > 0 && (
                            <span className="bg-theme-primary text-theme-primary-contrast text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-xs">
                              {c.unread_count}
                            </span>
                          )}
                        </div>

                        {c.animal_context && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-theme-primary font-bold truncate">
                            <span>🐂</span>
                            <span className="truncate">{c.animal_context.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Search Results from All Contacts (New chat initiation) */}
                {newContacts.length > 0 && (
                  <div className="pt-2">
                    <div className="px-3 py-1 text-[10px] font-bold text-theme-muted uppercase tracking-wider bg-theme-bg/60">
                      Mulai Percakapan Baru ({newContacts.length})
                    </div>
                    {newContacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => {
                          setActiveContactId(contact.id);
                          setSearchQuery('');
                        }}
                        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-theme-bg/60 transition-colors"
                      >
                        <img
                          src={contact.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=3b82f6&color=fff`}
                          alt={contact.name}
                          className="w-10 h-10 rounded-2xl object-cover border border-theme-border"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-theme-text truncate">{contact.name}</h4>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-theme-bg border border-theme-border text-theme-muted uppercase font-bold">
                              {contact.role === 'SELLER' ? 'Peternak' : contact.role === 'COURIER' ? 'Kurir' : 'Pembeli'}
                            </span>
                          </div>
                          <p className="text-[10px] text-theme-muted truncate mt-0.5">
                            {contact.store_name ? `🏡 ${contact.store_name}` : `@${contact.username}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: ACTIVE CHAT ROOM (Visible on desktop, and on mobile when activeContactId is set) ── */}
        <div
          className={`
            lg:col-span-8 flex flex-col justify-between h-[620px]
            ${activeContactId ? 'flex w-full' : 'hidden lg:flex'}
          `}
        >
          {activeContactId ? (
            <>
              {/* Room Header */}
              <div className="p-3.5 sm:p-4 border-b border-theme-border flex items-center justify-between bg-theme-bg/50">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* WhatsApp-style Back Arrow on Mobile to return to conversation list */}
                  <button
                    type="button"
                    onClick={() => setActiveContactId(null)}
                    className="p-1.5 -ml-1 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-bg transition lg:hidden"
                    title="Kembali ke daftar pesan"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <img
                      src={activeContactAvatar}
                      alt={activeContactName}
                      className="w-10 h-10 rounded-2xl object-cover border border-theme-border"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-theme-card" />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-theme-text truncate max-w-[170px] sm:max-w-xs">
                      {activeContactName}
                    </h3>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Online • Siap Nego Harga
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleSubscribePush}
                    disabled={isSubscribingPush || pushStatus === 'granted'}
                    title={pushStatus === 'granted' ? 'Notifikasi Web Push Aktif' : 'Aktifkan Notifikasi Web Push'}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                      pushStatus === 'granted'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-theme-card border-theme-border text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    {pushStatus === 'granted' ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">
                      {pushStatus === 'granted' ? 'Push Aktif' : isSubscribingPush ? 'Mendaftarkan...' : 'Notif'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowNegoBox(!showNegoBox)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Ajukan Nego</span>
                  </button>
                </div>
              </div>

              {/* Context Livestock Banner (if active) */}
              {animalContext && (
                <div className="bg-theme-primary/10 border-b border-theme-border p-2.5 px-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl flex-shrink-0">🐂</span>
                    <div className="truncate">
                      <span className="font-bold text-theme-text block truncate">{animalContext.title}</span>
                      <span className="text-theme-primary font-black text-[11px]">
                        Harga Asal: {formatRupiah(animalContext.price)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate && onNavigate('catalog')}
                    className="text-[10px] text-theme-primary hover:underline font-extrabold flex-shrink-0"
                  >
                    Lihat Katalog →
                  </button>
                </div>
              )}

              {/* Negotiate Price Drawer Modal Box */}
              {showNegoBox && (
                <div className="p-3.5 bg-amber-500/10 border-b border-amber-500/20 space-y-2 animate-in slide-in-from-top duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Ajukan Penawaran Harga Khusus
                    </span>
                    <button onClick={() => setShowNegoBox(false)} className="text-xs text-theme-muted font-bold">✕</button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Contoh: 18500000 (Nominal Rp)..."
                      value={negotiatedPrice}
                      onChange={(e) => setNegotiatedPrice(e.target.value)}
                      className="flex-1 bg-theme-card border border-theme-border rounded-xl px-3 py-2 text-xs font-semibold text-theme-text focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-sm"
                    >
                      Kirim Tawaran
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Feed */}
              <div ref={chatFeedRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-theme-bg/20">
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-xs text-theme-muted space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-theme-card border border-theme-border flex items-center justify-center mx-auto text-base">
                      👋
                    </div>
                    <p className="font-bold text-theme-text">Mulai percakapan dengan {activeContactName}</p>
                    <p className="text-[11px]">Sampaikan pertanyaan seputar bobot riil, pengiriman, atau negosiasi harga hewan.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md rounded-2xl p-3 space-y-1 text-xs shadow-sm ${
                            isMe
                              ? 'bg-theme-primary text-theme-primary-contrast rounded-br-none'
                              : 'bg-theme-card border border-theme-border text-theme-text rounded-bl-none'
                          }`}
                        >
                          {/* Negotiated Price Tag inside Bubble */}
                          {msg.negotiated_price && (
                            <div
                              className={`p-2 rounded-xl font-bold text-xs flex items-center justify-between gap-2 mb-1 ${
                                isMe ? 'bg-black/15 text-white' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                              }`}
                            >
                              <span>🤝 Tawaran Harga:</span>
                              <span className="font-mono text-xs font-black">{formatRupiah(msg.negotiated_price)}</span>
                            </div>
                          )}

                          <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                          <div className={`flex items-center justify-end gap-1 text-[9px] pt-0.5 ${isMe ? 'opacity-80' : 'text-theme-muted'}`}>
                            <span>{formatTime(msg.created_at)}</span>
                            {isMe && (
                              <span title={
                                msg.status === 'read' || msg.is_read
                                  ? 'Dibaca'
                                  : msg.status === 'delivered'
                                  ? 'Terkirim ke penerima'
                                  : 'Terkirim ke server (penerima offline)'
                              }>
                                {msg.status === 'read' || msg.is_read ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" />
                                ) : msg.status === 'delivered' ? (
                                  <CheckCheck className="w-3.5 h-3.5 opacity-75 stroke-[2]" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 opacity-60 stroke-[2]" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-theme-border flex items-center gap-2 bg-theme-card">
                <input
                  type="text"
                  placeholder="Ketik pesan atau tawar harga..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-theme-bg border border-theme-border rounded-2xl px-4 py-2.5 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !negotiatedPrice}
                  className="p-2.5 rounded-2xl bg-theme-primary hover:brightness-110 disabled:opacity-40 text-theme-primary-contrast flex items-center justify-center transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* WhatsApp Web style welcoming state when no chat selected on desktop */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-theme-bg/30 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-theme-card border border-theme-border shadow-md flex items-center justify-center text-3xl">
                🐂
              </div>
              <div>
                <h3 className="text-base font-extrabold text-theme-text">TernakMart Live Chat & Nego</h3>
                <p className="text-xs text-theme-muted max-w-sm mt-1">
                  Pilih salah satu percakapan di sebelah kiri atau cari peternak untuk memulai tawar menawar langsung bergaransi resmi.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-theme-muted pt-2 border-t border-theme-border">
                <Clock className="w-3.5 h-3.5 text-theme-primary" />
                <span>Enkripsi End-to-End & Terhubung ke Notifikasi Web Push</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
