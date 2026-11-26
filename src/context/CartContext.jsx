import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ia-horologe-cart')) || []; }
    catch { return []; }
  });
  useEffect(() => localStorage.setItem('ia-horologe-cart', JSON.stringify(cart)), [cart]);
  useEffect(() => {
    let active = true;
    fetch('/api/products').then(r => r.ok ? r.json() : null).then(data => {
      if (!active || !data?.products) return;
      setCart(items => items.flatMap(item => {
        const product = data.products.find(p => p.id === item.id);
        if (!product) return [];
        return [{ id: product.id, name: product.name, price: Number(product.price) || 0, image: product.images?.[0] || '', quantity: item.quantity }];
      }));
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const addItem = (product, quantity = 1) => {
    setCart(items => {
      const found = items.find(i => i.id === product.id);
      return found ? items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...items, { id: product.id, name: product.name, price: Number(product.price) || 0, image: product.images?.[0] || '', quantity: Math.max(1, quantity) }];
    });
  };
  const updateQuantity = (id, quantity) => setCart(items => quantity > 0 ? items.map(i => i.id === id ? { ...i, quantity } : i) : items.filter(i => i.id !== id));
  const removeItem = id => setCart(items => items.filter(i => i.id !== id));
  const clearCart = () => setCart([]);
  const count = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
  return <CartContext.Provider value={{ cart, addItem, updateQuantity, removeItem, clearCart, count, subtotal }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
