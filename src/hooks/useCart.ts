// hooks/useCart.ts
import { useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  description: string;
}

// Tạo một event bus đơn giản để thông báo thay đổi
const cartUpdateEvent = new Event('cartUpdated');

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    // Kích hoạt event khi cart thay đổi
    window.dispatchEvent(cartUpdateEvent);
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
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
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    setShowOrderSuccess(true);
    clearCart();
  };

  const closeOrderSuccess = () => {
    setShowOrderSuccess(false);
  };

  return {
    cartItems, // QUAN TRỌNG: Trả về cartItems để component có thể subscribe
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    showOrderSuccess,
    handleCheckout,
    closeOrderSuccess,
  };
};