// hooks/useCart.ts
import { useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  quantity: number;
  note?: string; // Thêm trường note
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        return [...prevItems, { ...item, quantity }];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  // Thêm hàm updateNote
  const updateNote = (id: number, note: string) => {
    setCartItems(prevItems =>
      prevItems.map(item => 
        item.id === id ? { ...item, note: note.trim() || undefined } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote, // Xuất hàm updateNote
    clearCart,
    getTotalItems,
    getTotalPrice,
  };
};