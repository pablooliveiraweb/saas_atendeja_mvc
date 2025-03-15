import React, { useState } from 'react';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  IconButton,
  Input,
  Textarea,
  useColorModeValue,
  Badge,
  Flex,
  useToast
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { useCart } from '../../contexts/CartContext';
import CartItem from '../CartItem';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { 
    items, 
    removeItem, 
    updateItemQuantity, 
    updateItemNotes,
    totalItems, 
    totalPrice,
    discount,
    finalPrice,
    coupon,
    couponCode,
    setCouponCode,
    applyCoupon,
    removeCoupon
  } = useCart();
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const toast = useToast();
  
  // Cores
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite um código de cupom',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsApplyingCoupon(true);
    try {
      await applyCoupon();
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Sacola ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
        </DrawerHeader>

        <DrawerBody>
          {items.length === 0 ? (
            <Box p={6} textAlign="center">
              <Text fontSize="lg" mb={4}>
                Sua sacola está vazia
              </Text>
              <Text color={secondaryTextColor}>
                Adicione itens ao seu pedido para continuar
              </Text>
            </Box>
          ) : (
            <>
              <VStack spacing={4} align="stretch" mb={6}>
                {items.map((item) => (
                  <CartItem 
                    key={item.product.id} 
                    product={item.product} 
                    quantity={item.quantity}
                    notes={item.notes}
                    selectedOptions={item.selectedOptions}
                    onIncrement={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                    onDecrement={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                    onRemove={() => removeItem(item.product.id)}
                    onNotesChange={(notes) => updateItemNotes(item.product.id, notes)}
                  />
                ))}
              </VStack>
              
              {/* Cupom de desconto */}
              <Box mb={6}>
                <Heading size="sm" mb={3}>Cupom de desconto</Heading>
                {coupon ? (
                  <Box 
                    p={3} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    borderColor="green.200"
                    bg="green.50"
                  >
                    <Flex justifyContent="space-between" alignItems="center">
                      <Box>
                        <Badge colorScheme="green" mb={1}>
                          {coupon.code}
                        </Badge>
                        <Text fontSize="sm">
                          Desconto: R$ {discount.toFixed(2)}
                        </Text>
                      </Box>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        variant="outline"
                        onClick={removeCoupon}
                      >
                        Remover
                      </Button>
                    </Flex>
                  </Box>
                ) : (
                  <HStack>
                    <Input 
                      placeholder="Código do cupom" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button 
                      colorScheme="blue" 
                      onClick={handleApplyCoupon}
                      isLoading={isApplyingCoupon}
                    >
                      Aplicar
                    </Button>
                  </HStack>
                )}
              </Box>
              
              {/* Resumo do pedido */}
              <Box mb={4}>
                <Heading size="sm" mb={3}>Resumo</Heading>
                <VStack spacing={2} align="stretch">
                  <Flex justifyContent="space-between">
                    <Text>Subtotal</Text>
                    <Text>R$ {totalPrice.toFixed(2)}</Text>
                  </Flex>
                  
                  {discount > 0 && (
                    <Flex justifyContent="space-between" color="green.500">
                      <Text>Desconto</Text>
                      <Text>- R$ {discount.toFixed(2)}</Text>
                    </Flex>
                  )}
                  
                  <Divider my={1} />
                  
                  <Flex justifyContent="space-between" fontWeight="bold">
                    <Text>Total</Text>
                    <Text>R$ {finalPrice.toFixed(2)}</Text>
                  </Flex>
                </VStack>
              </Box>
            </>
          )}
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={onClose}>
            Continuar escolhendo
          </Button>
          <Button 
            colorScheme="blue"
            isDisabled={items.length === 0}
            onClick={() => {
              onClose();
              // Chamada para iniciar checkout pode ser adicionada aqui
            }}
          >
            Fazer pedido
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;