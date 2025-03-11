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

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateItemQuantity, updateItemNotes, totalItems, totalPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const handleSubmitOrder = async () => {
    if (!customerName || !customerPhone) {
      toast({
        title: 'Informações necessárias',
        description: 'Por favor, informe seu nome e telefone para continuar.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione itens ao carrinho antes de finalizar o pedido.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Formatar o número de telefone para incluir o prefixo 55 se não estiver presente
      const formattedPhone = customerPhone.replace(/\D/g, '');
      const phoneWithPrefix = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;
      
      // TODO: Implement order submission to backend with phoneWithPrefix
      // This is a placeholder for the actual implementation
      console.log('Enviando pedido com telefone formatado:', phoneWithPrefix);
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      toast({
        title: 'Pedido enviado!',
        description: 'Seu pedido foi enviado com sucesso. Em breve entraremos em contato!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Clear cart and form after successful submission
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      onClose();
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Erro ao enviar pedido',
        description: 'Ocorreu um erro ao enviar seu pedido. Por favor, tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Seu Pedido {totalItems > 0 && <Badge ml={2} colorScheme="blue">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</Badge>}
        </DrawerHeader>

        <DrawerBody>
          {items.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" color={textColor}>Seu carrinho está vazio</Text>
              <Text mt={2} color="gray.500">Adicione itens do cardápio para fazer seu pedido</Text>
              <Button mt={6} colorScheme="blue" onClick={onClose}>
                Ver Cardápio
              </Button>
            </Box>
          ) : (
            <>
              <VStack spacing={4} align="stretch" mb={6}>
                {items.map((item) => (
                  <Box 
                    key={item.product.id} 
                    p={3} 
                    borderWidth="1px" 
                    borderColor={borderColor} 
                    borderRadius="md"
                    bg={bgColor}
                  >
                    <HStack justifyContent="space-between">
                      <VStack align="start" spacing={1}>
                        <Heading size="sm">{item.product.name}</Heading>
                        <Text fontSize="sm" color="gray.500">
                          R$ {item.product.price.toFixed(2)} cada
                        </Text>
                      </VStack>
                      <Text fontWeight="bold">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </Text>
                    </HStack>

                    <Divider my={2} />

                    <HStack justifyContent="space-between">
                      <HStack>
                        <IconButton
                          aria-label="Diminuir quantidade"
                          icon={<MinusIcon />}
                          size="sm"
                          onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                        />
                        <Text fontWeight="medium" mx={2}>{item.quantity}</Text>
                        <IconButton
                          aria-label="Aumentar quantidade"
                          icon={<AddIcon />}
                          size="sm"
                          onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                        />
                      </HStack>
                      <IconButton
                        aria-label="Remover item"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeItem(item.product.id)}
                      />
                    </HStack>

                    {item.notes && (
                      <Text fontSize="sm" mt={2} color="gray.500">
                        Observações: {item.notes}
                      </Text>
                    )}

                    <Textarea
                      mt={2}
                      placeholder="Alguma observação? Ex: sem cebola, bem passado, etc."
                      size="sm"
                      value={item.notes || ''}
                      onChange={(e) => updateItemNotes(item.product.id, e.target.value)}
                    />
                  </Box>
                ))}
              </VStack>

              <Divider mb={6} />

              <Box mb={6}>
                <Heading size="md" mb={4}>Informações para entrega</Heading>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text mb={1} fontWeight="medium">Nome</Text>
                    <Input 
                      placeholder="Seu nome completo" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </Box>
                  <Box>
                    <Text mb={1} fontWeight="medium">Telefone</Text>
                    <Input 
                      placeholder="Seu telefone com DDD" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      onBlur={(e) => {
                        // Formatar o número ao perder o foco do campo
                        let value = e.target.value.replace(/\D/g, '');
                        
                        // Limitar a 11 dígitos (DDD + número)
                        if (value.length > 11) {
                          value = value.substring(0, 11);
                        }
                        
                        // Aplicar máscara para exibição
                        if (value.length <= 2) {
                          setCustomerPhone(value.length > 0 ? `(${value}` : value);
                        } else if (value.length <= 7) {
                          setCustomerPhone(`(${value.substring(0, 2)}) ${value.substring(2)}`);
                        } else {
                          setCustomerPhone(`(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`);
                        }
                      }}
                    />
                  </Box>
                  <Box>
                    <Text mb={1} fontWeight="medium">Observações do pedido</Text>
                    <Textarea 
                      placeholder="Alguma observação para o pedido ou entrega" 
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </Box>
                </VStack>
              </Box>
            </>
          )}
        </DrawerBody>

        {items.length > 0 && (
          <DrawerFooter borderTopWidth="1px">
            <VStack width="100%" spacing={4}>
              <Flex width="100%" justifyContent="space-between">
                <Text fontWeight="bold">Total:</Text>
                <Text fontWeight="bold" fontSize="xl">R$ {totalPrice.toFixed(2)}</Text>
              </Flex>
              <Button 
                colorScheme="green" 
                width="100%" 
                size="lg"
                isLoading={isSubmitting}
                onClick={handleSubmitOrder}
              >
                Finalizar Pedido
              </Button>
              <Button variant="outline" width="100%" onClick={clearCart}>
                Limpar Carrinho
              </Button>
            </VStack>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default Cart;