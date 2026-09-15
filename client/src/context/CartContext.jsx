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
                  if (gi?.animal_id && !res.data.items.some(i => i.animal_id === gi.animal_id)) {
                    try {
                      await api.post('/carts/add', { animal_id: gi.animal_id, notes: gi.notes });
                    } catch (addErr) {
                      // Silently catch if animal is unavailable or invalid
                    }
                  }
                }
              }
              localStorage.removeItem('ternakmart_guest_cart');
              const refreshed = await api.get('/carts');
              setCart(refreshed.data);
              return;
            } catch (e) {
              localStorage.removeItem('ternakmart_guest_cart');
            }
          }
          setCart(res.data);
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
          setCart({ id: 'guest_cart', items: JSON.parse(guestSaved) });
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
      if (!animalObj) {
        try {
          const res = await api.get(`/animals/detail/${animal}`);
          if (res.success) animalObj = res.data;
        } catch (e) {}
      }

      if (!animalObj) {
        showToast('⚠️ Hewan tidak ditemukan');
        return { success: false, message: 'Hewan tidak ditemukan' };
      }

      const existingCart = localStorage.getItem('ternakmart_guest_cart');
      let currentItems = existingCart ? JSON.parse(existingCart) : [];
      const itemIndex = currentItems.findIndex(i => i.animal_id === animalObj.id);

      if (itemIndex > -1) {
        currentItems[itemIndex].quantity = (currentItems[itemIndex].quantity || 1) + qty;
      } else {
        currentItems.push({
          id: `guest_item_${Date.now()}`,
          animal_id: animalObj.id,
          title: animalObj.title,
          price: animalObj.price,
          weight_kg: animalObj.weight_kg,
          image_url: animalObj.primary_image || (animalObj.images && animalObj.images[0]) || '',
          quantity: qty,
          store_name: animalObj.store_name,
          store_tier: animalObj.store_tier,
          farm_address: animalObj.farm_address
        });
      }

      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(currentItems));
      setCart({ id: 'guest_cart', items: currentItems });
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

      if (qty === 0) {
        currentItems = currentItems.filter(i => i.animal_id !== animalId);
      } else {
        const item = currentItems.find(i => i.animal_id === animalId);
        if (item) item.quantity = qty;
      }

      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(currentItems));
      setCart({ id: 'guest_cart', items: currentItems });
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
      currentItems = currentItems.filter(i => !animalIds.includes(i.animal_id));
      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(currentItems));
      setCart({ id: 'guest_cart', items: currentItems });
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
