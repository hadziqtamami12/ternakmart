// CartContext.jsx - Livestock Cart Management (Supports Guest Users & LocalStorage)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState({ id: 'guest_cart', items: [] });
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartToast, setCartToast] = useState('');

  const showToast = (message) => {
    setCartToast(message);
    setTimeout(() => setCartToast(''), 3000);
  };

  // Helper to consolidate duplicate items by animal_id and sum their quantities
  const consolidateItems = (items) => {
    if (!Array.isArray(items)) return [];
    const map = new Map();
    for (const item of items) {
      if (!item?.animal_id && !item?.id) continue;
      const aId = String(item.animal_id || item.id);
      const itemQty = Math.max(1, parseInt(item.quantity) || 1);
      const itemImgs = Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : (item.image_url ? [item.image_url] : (item.primary_image ? [item.primary_image] : []));

      if (map.has(aId)) {
        const existing = map.get(aId);
        existing.quantity = (existing.quantity || 1) + itemQty;
        if (item.notes && !existing.notes) existing.notes = item.notes;
        if ((!existing.images || existing.images.length === 0) && itemImgs.length > 0) {
          existing.images = itemImgs;
          existing.image_url = itemImgs[0];
        }
      } else {
        map.set(aId, {
          ...item,
          animal_id: aId,
          quantity: itemQty,
          images: itemImgs,
          image_url: itemImgs[0] || item.image_url || item.primary_image || ''
        });
      }
    }
    return Array.from(map.values());
  };

  // Load cart from server if authenticated, or localStorage if guest
  const fetchCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.get('/carts');
        if (res.success && res.data) {
          // If there were guest items, merge them
          const guestSaved = localStorage.getItem('ternakmart_guest_cart');
          if (guestSaved) {
            try {
              const guestItems = JSON.parse(guestSaved);
              if (Array.isArray(guestItems)) {
                for (const gi of guestItems) {
                  if (gi?.animal_id && !res.data.items.some(i => String(i.animal_id) === String(gi.animal_id))) {
                    try {
                      await api.post('/carts/add', {
                        animal_id: gi.animal_id,
                        notes: gi.notes,
                        quantity: gi.quantity || 1
                      });
                    } catch (addErr) {
                      // Silently catch if animal is unavailable or invalid
                    }
                  }
                }
              }
              localStorage.removeItem('ternakmart_guest_cart');
              const refreshed = await api.get('/carts');
              const cleanRefreshed = refreshed.data ? {
                ...refreshed.data,
                items: consolidateItems(refreshed.data.items)
              } : { id: 'cart', items: [] };
              setCart(cleanRefreshed);
              return;
            } catch (e) {
              localStorage.removeItem('ternakmart_guest_cart');
            }
          }
          const cleanData = {
            ...res.data,
            items: consolidateItems(res.data.items)
          };
          setCart(cleanData);
        }
      } catch (err) {
        console.warn('Could not fetch user cart:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest User: Read from localStorage
      const guestSaved = localStorage.getItem('ternakmart_guest_cart');
      if (guestSaved) {
        try {
          const parsed = JSON.parse(guestSaved);
          const normalized = (Array.isArray(parsed) ? parsed : []).map(i => {
            const rawImgs = Array.isArray(i.images) && i.images.length > 0
              ? i.images
              : (i.image_url ? [i.image_url] : (i.primary_image ? [i.primary_image] : []));
            return {
              ...i,
              animal_id: i.animal_id || i.id,
              images: rawImgs,
              image_url: rawImgs[0] || i.image_url || ''
            };
          });
          const clean = consolidateItems(normalized);
          setCart({ id: 'guest_cart', items: clean });
          localStorage.setItem('ternakmart_guest_cart', JSON.stringify(clean));
        } catch (e) {
          setCart({ id: 'guest_cart', items: [] });
        }
      } else {
        setCart({ id: 'guest_cart', items: [] });
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (animal, notes = '', quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity) || 1);
    const itemTitle = typeof animal === 'object' ? (animal.title || 'Ternak') : 'Hewan Ternak';

    if (isAuthenticated) {
      const animalId = typeof animal === 'object' ? animal.id : animal;
      const res = await api.post('/carts/add', { animal_id: animalId, notes, quantity: qty });
      if (res.success) {
        await fetchCart();
        showToast(`✓ ${itemTitle} ditambahkan ke keranjang!`);
      } else {
        showToast(`⚠️ ${res.message || 'Gagal menambahkan ternak'}`);
      }
      return res;
    } else {
      // Guest Cart
      let animalObj = typeof animal === 'object' ? animal : null;
      if (!animalObj || !animalObj.title) {
        try {
          const targetId = typeof animal === 'object' ? (animal.id || animal.animal_id) : animal;
          const res = await api.get(`/animals/detail/${targetId}`);
          if (res.success && res.data) animalObj = res.data;
        } catch (e) {}
      }

      if (!animalObj) {
        showToast('⚠️ Hewan tidak ditemukan');
        return { success: false, message: 'Hewan tidak ditemukan' };
      }

      const existingCart = localStorage.getItem('ternakmart_guest_cart');
      let currentItems = existingCart ? JSON.parse(existingCart) : [];
      if (!Array.isArray(currentItems)) currentItems = [];

      const targetIdStr = String(animalObj.id || animalObj.animal_id);
      const itemIndex = currentItems.findIndex(i => String(i.animal_id || i.id) === targetIdStr);

      const rawImages = Array.isArray(animalObj.images) && animalObj.images.length > 0
        ? animalObj.images
        : (animalObj.image_url ? [animalObj.image_url] : (animalObj.primary_image ? [animalObj.primary_image] : []));
      const primaryImg = rawImages[0] || animalObj.image_url || animalObj.primary_image || '';

      if (itemIndex > -1) {
        currentItems[itemIndex].quantity = (parseInt(currentItems[itemIndex].quantity) || 1) + qty;
        if (notes && !currentItems[itemIndex].notes) {
          currentItems[itemIndex].notes = notes;
        }
        if (!currentItems[itemIndex].images || currentItems[itemIndex].images.length === 0) {
          currentItems[itemIndex].images = rawImages;
          currentItems[itemIndex].image_url = primaryImg;
        }
        if (!currentItems[itemIndex].category && animalObj.category) {
          currentItems[itemIndex].category = animalObj.category;
        }
        if (!currentItems[itemIndex].breed && animalObj.breed) {
          currentItems[itemIndex].breed = animalObj.breed;
        }
      } else {
        currentItems.push({
          id: animalObj.id || `guest_item_${Date.now()}`,
          animal_id: animalObj.id || targetIdStr,
          slug: animalObj.slug || '',
          title: animalObj.title,
          category: animalObj.category || 'TERNAK',
          breed: animalObj.breed || '',
          price: animalObj.price,
          weight_kg: animalObj.weight_kg,
          age_months: animalObj.age_months,
          gender: animalObj.gender,
          teeth_poel: animalObj.teeth_poel || 'POEL_1',
          vaccination_status: animalObj.vaccination_status || '',
          skkh_verification_status: animalObj.skkh_verification_status || false,
          skkh_certificate_url: animalObj.skkh_certificate_url || '',
          images: rawImages,
          image_url: primaryImg,
          video_url: animalObj.video_url || '',
          description: animalObj.description || '',
          is_qurban_eligible: animalObj.is_qurban_eligible || false,
          quantity: qty,
          store_id: animalObj.store_id || (animalObj.store && animalObj.store.id),
          store_name: animalObj.store_name || animalObj.store?.store_name || 'Peternak Barokah',
          store_tier: animalObj.store_tier || animalObj.store?.tier || 'BRONZE',
          farm_address: animalObj.farm_address || animalObj.store?.farm_address || '',
          store: animalObj.store || {
            store_name: animalObj.store_name || 'Peternak Barokah',
            farm_address: animalObj.farm_address || '',
            tier: animalObj.store_tier || 'BRONZE'
          },
          notes: notes || ''
        });
      }

      const consolidated = consolidateItems(currentItems);
      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(consolidated));
      setCart({ id: 'guest_cart', items: consolidated });
      showToast(`✓ ${animalObj.title} ditambahkan ke keranjang!`);
      return { success: true };
    }
  };

  const updateQuantity = async (animalId, quantity) => {
    const qty = Math.max(0, parseInt(quantity) || 0);

    if (isAuthenticated) {
      if (qty === 0) {
        const res = await api.delete(`/carts/item/${animalId}`);
        if (res.success) await fetchCart();
        return res;
      } else {
        const res = await api.put('/carts/quantity', { animal_id: animalId, quantity: qty });
        if (res.success) await fetchCart();
        return res;
      }
    } else {
      const existingCart = localStorage.getItem('ternakmart_guest_cart');
      let currentItems = existingCart ? JSON.parse(existingCart) : [];
      if (!Array.isArray(currentItems)) currentItems = [];

      const targetIdStr = String(animalId);
      if (qty === 0) {
        currentItems = currentItems.filter(i => String(i.animal_id) !== targetIdStr);
      } else {
        const item = currentItems.find(i => String(i.animal_id) === targetIdStr);
        if (item) item.quantity = qty;
      }

      const consolidated = consolidateItems(currentItems);
      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(consolidated));
      setCart({ id: 'guest_cart', items: consolidated });
      return { success: true };
    }
  };

  const bulkDelete = async (animalIds) => {
    if (!animalIds || animalIds.length === 0) return { success: true };

    if (isAuthenticated) {
      try {
        const res = await api.post('/carts/bulk-delete', { animal_ids: animalIds });
        if (res.success) await fetchCart();
        return res;
      } catch (err) {
        console.warn('Bulk delete error:', err);
        return { success: false, message: err.message };
      }
    } else {
      const existingCart = localStorage.getItem('ternakmart_guest_cart');
      let currentItems = existingCart ? JSON.parse(existingCart) : [];
      if (!Array.isArray(currentItems)) currentItems = [];
      const idSet = new Set(animalIds.map(id => String(id)));
      currentItems = currentItems.filter(i => !idSet.has(String(i.animal_id)));
      const consolidated = consolidateItems(currentItems);
      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(consolidated));
      setCart({ id: 'guest_cart', items: consolidated });
      return { success: true };
    }
  };

  const removeFromCart = async (animalId) => {
    return await updateQuantity(animalId, 0);
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/carts/clear');
        await fetchCart();
      } catch (e) {}
    }
    setCart({ id: 'guest_cart', items: [] });
    localStorage.removeItem('ternakmart_guest_cart');
    return { success: true };
  };

  const totalCount = (cart.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart.items || [],
        count: totalCount,
        loading,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        toggleDrawer: () => setIsDrawerOpen(prev => !prev),
        addToCart,
        updateQuantity,
        bulkDelete,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
        showToast
      }}
    >
      {children}

      {/* Global Responsive Toast for Add to Cart (Mobile & Desktop) */}
      {cartToast && (
        <div className="fixed bottom-24 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto sm:max-w-sm z-[99999] bg-slate-900/95 border border-emerald-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            ✓
          </div>
          <div className="min-w-0 pr-2 flex-1">
            <p className="text-xs font-bold truncate">{cartToast}</p>
            <p className="text-[10px] text-slate-400">Item keranjang berhasil diperbarui.</p>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
