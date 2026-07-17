import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client, { getErrorMessage } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const { data } = await client.get('/cart');
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      // silently ignore - cart just stays empty
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart(productId, quantity = 1) {
    try {
      const { data } = await client.post('/cart', { product_id: productId, quantity });
      setItems(data.items);
      const newTotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
      setTotal(Math.round(newTotal * 100) / 100);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }

  async function updateQuantity(cartItemId, quantity) {
    try {
      const { data } = await client.put(`/cart/${cartItemId}`, { quantity });
      setItems(data.items);
      const newTotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
      setTotal(Math.round(newTotal * 100) / 100);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }

  async function removeItem(cartItemId) {
    try {
      const { data } = await client.delete(`/cart/${cartItemId}`);
      setItems(data.items);
      const newTotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
      setTotal(Math.round(newTotal * 100) / 100);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }

  async function clearCart() {
    try {
      await client.delete('/cart');
      setItems([]);
      setTotal(0);
    } catch (err) {
      // ignore
    }
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, total, itemCount, loading, addToCart, updateQuantity, removeItem, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
