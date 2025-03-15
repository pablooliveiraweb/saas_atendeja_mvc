import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, SelectedOption } from '../types/product';
import couponService, { Coupon, ValidateCouponResponse } from '../services/couponService';
import { useToast } from '@chakra-ui/react';

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  selectedOptions?: SelectedOption[];
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
  coupon: Coupon | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  applyCoupon: () => Promise<void>;
  removeCoupon: () => void;
  discount: number;
  finalPrice: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const toast = useToast();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('@Atende:cart');
    const storedRestaurantId = localStorage.getItem('@Atende:cartRestaurantId');
    const storedCoupon = localStorage.getItem('@Atende:cartCoupon');
    
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
    
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId);
    }

    if (storedCoupon) {
      const { coupon, discount } = JSON.parse(storedCoupon);
      setCoupon(coupon);
      setDiscount(discount);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('@Atende:cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('@Atende:cart');
      // Se o carrinho estiver vazio, também remover o cupom
      removeCoupon();
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

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    if (coupon) {
      localStorage.setItem('@Atende:cartCoupon', JSON.stringify({ coupon, discount }));
    } else {
      localStorage.removeItem('@Atende:cartCoupon');
    }
  }, [coupon, discount]);

  const addItem = (item: CartItem) => {
    // Verificar se já existe um item com o mesmo produto e as mesmas opções
    const existingItemIndex = items.findIndex(cartItem => {
      // Verificar se é o mesmo produto
      if (cartItem.product.id !== item.product.id) return false;
      
      // Se não tiver opções selecionadas, é o mesmo item
      if (!item.selectedOptions?.length && !cartItem.selectedOptions?.length) return true;
      
      // Se um tem opções e o outro não, são diferentes
      if ((!item.selectedOptions?.length && cartItem.selectedOptions?.length) || 
          (item.selectedOptions?.length && !cartItem.selectedOptions?.length)) return false;
      
      // Se têm números diferentes de opções, são diferentes
      if (item.selectedOptions?.length !== cartItem.selectedOptions?.length) return false;
      
      // Comparar cada opção selecionada
      return item.selectedOptions?.every(selectedOption => {
        return cartItem.selectedOptions?.some(existingOption => 
          existingOption.groupName === selectedOption.groupName && 
          existingOption.option.name === selectedOption.option.name
        );
      });
    });

    if (existingItemIndex >= 0) {
      // Atualizar quantidade se o item já existe
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      setItems(updatedItems);
    } else {
      // Adicionar novo item
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
    removeCoupon();
    localStorage.removeItem('@Atende:cart');
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe um código de cupom',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!restaurantId) {
      toast({
        title: 'Erro',
        description: 'Não foi possível identificar o restaurante',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await couponService.validateCoupon(
        couponCode,
        restaurantId,
        totalPrice
      );
      
      setCoupon(result.coupon);
      setDiscount(result.discount);
      setCouponCode('');
      
      toast({
        title: 'Cupom aplicado',
        description: `Desconto de R$ ${result.discount.toFixed(2)} aplicado ao pedido`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível aplicar o cupom',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscount(0);
    setCouponCode('');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce((total, item) => {
    // Preço base do produto x quantidade
    let itemTotal = item.product.price * item.quantity;
    
    // Adicionar preço dos complementos, se houver
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      const optionsTotal = item.selectedOptions.reduce(
        (sum, option) => sum + option.option.price, 
        0
      );
      itemTotal += optionsTotal * item.quantity;
    }
    
    return total + itemTotal;
  }, 0);

  const finalPrice = Math.max(totalPrice - discount, 0);

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
        coupon,
        couponCode,
        setCouponCode,
        applyCoupon,
        removeCoupon,
        discount,
        finalPrice,
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