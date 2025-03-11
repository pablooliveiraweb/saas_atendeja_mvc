import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  additionalOptions?: any[];
}

interface CartContextData {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  restaurantId: string | null;
  setRestaurantId: (id: string) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('@Atende:cart');
    const storedRestaurantId = localStorage.getItem('@Atende:cartRestaurantId');
    
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
    
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('@Atende:cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('@Atende:cart');
    }
  }, [items]);

  // Save restaurantId to localStorage whenever it changes
  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem('@Atende:cartRestaurantId', restaurantId);
    } else {
      localStorage.removeItem('@Atende:cartRestaurantId');
    }
  }, [restaurantId]);

  const addItem = (item: CartItem) => {
    // Check if item already exists in cart
    const existingItemIndex = items.findIndex(
      cartItem => cartItem.product.id === item.product.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([...items, item]);
    }
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.product.id !== productId));
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedItems = items.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    setItems(updatedItems);
  };

  const updateItemNotes = (productId: string, notes: string) => {
    const updatedItems = items.map(item => {
      if (item.product.id === productId) {
        return { ...item, notes };
      }
      return item;
    });

    setItems(updatedItems);
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('@Atende:cart');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        updateItemNotes,
        clearCart,
        totalItems,
        totalPrice,
        restaurantId,
        setRestaurantId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}