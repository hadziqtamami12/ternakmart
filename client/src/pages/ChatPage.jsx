// ChatPage.jsx - Real-Time Livestock Chat & Price Negotiation
import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  DollarSign,
  Store,
  User,
  ArrowLeft,
  CheckCheck,
  Tag
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
  const [activeContactId, setActiveContactId] = useState(targetUserId || 'usr_seller_001');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [showNegoBox, setShowNegoBox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animalContext, setAnimalContext] = useState(initialAnimal || null);

  const chatFeedRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setDocumentTitle('Tawar & Chat Ternak');
    fetchConversations();
  }, []);

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

  const previousCountRef = useRef(0);

  const fetchConversations = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/chats/conversations');
      if (res.success && res.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.warn('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId, showLoading = true) => {
    try {
      const res = await api.get(`/chats/${contactId}`);
      if (res.success && res.data) {
        if (!showLoading && res.data.length > previousCountRef.current) {
          // Play crystal ding chime on new message from the other person
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
        fetchConversations();
      }
    } catch (err) {
      alert(err.message || 'Gagal mengirim pesan.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-theme-text">Silakan Masuk Terlebih Dahulu</h2>
        <p className="text-xs text-theme-muted">Anda perlu login untuk bernegosiasi langsung dengan peternak.</p>
        <button onClick={() => onNavigate('auth')} className="px-5 py-2.5 bg-theme-primary text-white text-xs font-bold rounded-xl">
          Masuk Akun
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28">
      <div className="bg-theme-card border border-theme-border rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left: Conversations List (4 cols) */}
        <div className="lg:col-span-4 border-r border-theme-border flex flex-col">
          <div className="p-4 border-b border-theme-border flex items-center justify-between">
            <h2 className="font-extrabold text-base text-theme-text">Pesan & Negosiasi</h2>
            <button onClick={onBack} className="text-xs text-theme-muted hover:text-theme-text lg:hidden">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-theme-border/60">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-theme-muted">
                Belum ada riwayat percakapan. Mulai tawar ternak dari katalog!
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.contact_id}
                  onClick={() => {
                    setActiveContactId(c.contact_id);
                    if (c.animal_context) setAnimalContext(c.animal_context);
                  }}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    activeContactId === c.contact_id ? 'bg-theme-primary-light/40' : 'hover:bg-theme-bg'
                  }`}
                >
                  <img
                    src={c.contact_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.contact_name)}`}
                    alt={c.contact_name}
                    className="w-11 h-11 rounded-2xl object-cover border border-theme-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-theme-text truncate">{c.contact_name}</h4>
                      {c.unread_count > 0 && (
                        <span className="bg-theme-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-theme-muted truncate mt-0.5">{c.last_message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Chat Room (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {/* Room Header */}
          <div className="p-4 border-b border-theme-border flex items-center justify-between bg-theme-bg/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-theme-text">
                  {conversations.find(c => c.contact_id === activeContactId)?.contact_name || animalContext?.store_name || animalContext?.store?.name || 'Peternakan Barokah Farm (H. Syamsul)'}
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                  Online • Siap Nego Harga
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowNegoBox(!showNegoBox)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Ajukan Tawar Harga
            </button>
          </div>

          {/* Context Livestock Banner (if active) */}
          {animalContext && (
            <div className="bg-theme-primary-light/50 border-b border-theme-primary/20 p-3 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-xl">🐂</span>
                <div>
                  <span className="font-bold text-theme-text block">{animalContext.title}</span>
                  <span className="text-theme-primary font-bold">Harga Asal: {formatRupiah(animalContext.price)}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('catalog')}
                className="text-[11px] text-theme-primary hover:underline font-bold"
              >
                Lihat Detail
              </button>
            </div>
          )}

          {/* Negotiate Price Drawer Modal Box */}
          {showNegoBox && (
            <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 space-y-2 animate-in slide-in-from-top">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Tawar Harga Khusus
                </span>
                <button onClick={() => setShowNegoBox(false)} className="text-xs text-theme-muted font-bold">✕</button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Masukkan nominal tawaran Anda (Rp)..."
                  value={negotiatedPrice}
                  onChange={(e) => setNegotiatedPrice(e.target.value)}
                  className="flex-1 bg-theme-card border border-theme-border rounded-xl px-3 py-2 text-xs font-semibold text-theme-text"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                >
                  Kirim Tawaran
                </button>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div ref={chatFeedRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[420px]">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-xs text-theme-muted">
                Belum ada pesan. Sampaikan pertanyaan atau negosiasi Anda kepada peternak!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-md rounded-2xl p-3.5 space-y-1.5 text-xs shadow-sm ${
                        isMe
                          ? 'bg-theme-primary text-white rounded-br-none'
                          : 'bg-theme-bg border border-theme-border text-theme-text rounded-bl-none'
                      }`}
                    >
                      {/* Negotiated Price Tag inside Bubble */}
                      {msg.negotiated_price && (
                        <div
                          className={`p-2 rounded-xl font-bold text-xs flex items-center justify-between gap-2 ${
                            isMe ? 'bg-white/20 text-white' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          <span>🤝 Tawaran Harga:</span>
                          <span className="font-mono text-sm font-black">{formatRupiah(msg.negotiated_price)}</span>
                        </div>
                      )}

                      <p className="leading-relaxed">{msg.message}</p>

                      <div className={`flex items-center justify-end gap-1 text-[9px] ${isMe ? 'text-emerald-100' : 'text-theme-muted'}`}>
                        <span>{formatTime(msg.created_at)}</span>
                        {isMe && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-theme-border flex items-center gap-2 bg-theme-bg/30">
            <input
              type="text"
              placeholder="Ketik pesan atau pertanyaan untuk peternak..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-theme-card border border-theme-border rounded-2xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
            />
            <button
              type="submit"
              className="p-2.5 rounded-2xl bg-theme-primary hover:bg-theme-primary-hover text-white flex items-center justify-center transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
