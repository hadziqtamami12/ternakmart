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

  // Load cart from server if authenticated, or localStorage if guest
  const fetchCart = async () => {
    // Super Admin does not operate a buyer cart
    if (user?.role === 'ADMIN') {
      setCart({ id: 'admin_cart', items: [] });
      return;
    }

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
    if (isAuthenticated) {
      const animalId = typeof animal === 'object' ? animal.id : animal;
      const res = await api.post('/carts/add', { animal_id: animalId, notes, quantity: qty });
      if (res.success) {
        await fetchCart();
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

      if (!animalObj) return { success: false, message: 'Hewan tidak ditemukan' };

      const currentItems = cart.items || [];
      const existingIdx = currentItems.findIndex(i => i.animal_id === animalObj.id);
      let updated;
      if (existingIdx > -1) {
        updated = [...currentItems];
        updated[existingIdx].quantity = (updated[existingIdx].quantity || 1) + qty;
        if (notes) updated[existingIdx].notes = notes;
      } else {
        const newItem = {
          animal_id: animalObj.id,
          store_id: animalObj.store_id || (animalObj.store && animalObj.store.id),
          store_name: animalObj.store ? animalObj.store.store_name : 'Kandang Peternak',
          store_tier: animalObj.store ? animalObj.store.tier : 'BRONZE',
          farm_address: animalObj.store ? animalObj.store.farm_address : '',
          title: animalObj.title,
          category: animalObj.category,
          breed: animalObj.breed,
          weight_kg: animalObj.weight_kg,
          price: animalObj.price,
          images: animalObj.images,
          is_qurban_eligible: animalObj.is_qurban_eligible,
          skkh_verification_status: animalObj.skkh_verification_status,
          quantity: qty,
          notes: notes || ''
        };
        updated = [...currentItems, newItem];
      }
      setCart({ id: 'guest_cart', items: updated });
      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(updated));
      return { success: true, message: 'Ditambahkan ke keranjang belanja!' };
    }
  };

  const updateQuantity = async (animalId, newQuantity) => {
    const qty = parseInt(newQuantity);
    if (isAuthenticated) {
      const res = await api.put('/carts/quantity', { animal_id: animalId, quantity: qty });
      if (res.success) {
        await fetchCart();
      }
      return res;
    } else {
      let updated;
      if (qty <= 0) {
        updated = (cart.items || []).filter(i => i.animal_id !== animalId);
      } else {
        updated = (cart.items || []).map(i =>
          i.animal_id === animalId ? { ...i, quantity: qty } : i
        );
      }
      setCart({ id: 'guest_cart', items: updated });
      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(updated));
      return { success: true };
    }
  };

  const bulkDelete = async (animalIds) => {
    if (!Array.isArray(animalIds) || animalIds.length === 0) return { success: false };
    if (isAuthenticated) {
      const res = await api.post('/carts/bulk-delete', { animal_ids: animalIds });
      if (res.success) {
        await fetchCart();
      }
      return res;
    } else {
      const updated = (cart.items || []).filter(i => !animalIds.includes(i.animal_id));
      setCart({ id: 'guest_cart', items: updated });
      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(updated));
      return { success: true };
    }
  };

  const removeFromCart = async (animalId) => {
    if (isAuthenticated) {
      const res = await api.delete(`/carts/item/${animalId}`);
      if (res.success) {
        await fetchCart();
      }
      return res;
    } else {
      const updated = (cart.items || []).filter(i => i.animal_id !== animalId);
      setCart({ id: 'guest_cart', items: updated });
      localStorage.setItem('ternakmart_guest_cart', JSON.stringify(updated));
      return { success: true };
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await api.delete('/carts/clear');
    }
    setCart({ id: isAuthenticated ? cart.id : 'guest_cart', items: [] });
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
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
