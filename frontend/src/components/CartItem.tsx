import React from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  IconButton,
  HStack,
  VStack,
  Divider,
  Badge,
  Button
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { Product } from '../types/product';
import { formatCurrency } from '../utils/formatters';

interface CartItemProps {
  product: Product;
  quantity: number;
  notes?: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({
  product,
  quantity,
  notes,
  onIncrement,
  onDecrement,
  onRemove
}) => {
  // Cores independentes do tema do dashboard
  const textColor = '#333333';
  const secondaryTextColor = '#666666';
  const accentColor = '#3182ce';
  
  return (
    <Box py={3}>
      <Flex>
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            boxSize="70px"
            objectFit="cover"
            fallbackSrc="/product-placeholder.png"
            borderRadius="md"
            mr={3}
          />
        )}
        
        <VStack align="start" spacing={1} flex="1">
          <Flex w="100%" justify="space-between" align="center">
            <Text fontWeight="bold" fontSize="md" color={textColor}>
              {product.name}
            </Text>
            
            <IconButton
              aria-label="Remover item"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={onRemove}
            />
          </Flex>
          
          <Text fontSize="sm" color={accentColor} fontWeight="bold">
            {formatCurrency(product.price)} cada
          </Text>
          
          {notes && (
            <Badge colorScheme="gray" fontSize="xs" mt={1}>
              {notes}
            </Badge>
          )}
        </VStack>
      </Flex>
      
      <Flex mt={3} justify="space-between" align="center">
        <HStack spacing={1} border="1px solid" borderColor="gray.200" borderRadius="md" p={1}>
          <IconButton
            aria-label="Diminuir quantidade"
            icon={<MinusIcon />}
            size="xs"
            colorScheme="blue"
            variant="ghost"
            isDisabled={quantity <= 1}
            onClick={onDecrement}
          />
          
          <Text fontWeight="medium" mx={2} minW="20px" textAlign="center">
            {quantity}
          </Text>
          
          <IconButton
            aria-label="Aumentar quantidade"
            icon={<AddIcon />}
            size="xs"
            colorScheme="blue"
            variant="ghost"
            onClick={onIncrement}
          />
        </HStack>
        
        <Text fontWeight="bold" color={textColor}>
          {formatCurrency(product.price * quantity)}
        </Text>
      </Flex>
    </Box>
  );
};

export default CartItem; 