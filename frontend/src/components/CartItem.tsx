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
  Button,
  Textarea
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { Product, SelectedOption } from '../types/product';
import { formatCurrency } from '../utils/formatters';

interface CartItemProps {
  product: Product;
  quantity: number;
  notes?: string;
  selectedOptions?: SelectedOption[];
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onNotesChange?: (notes: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  product,
  quantity,
  notes,
  selectedOptions,
  onIncrement,
  onDecrement,
  onRemove,
  onNotesChange
}) => {
  // Calcular o preço unitário com complementos
  const calculateItemPrice = () => {
    let basePrice = product.price;
    
    // Adicionar preço dos complementos selecionados
    if (selectedOptions && selectedOptions.length > 0) {
      const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.option.price, 0);
      basePrice += optionsPrice;
    }
    
    return basePrice;
  };

  const unitPrice = calculateItemPrice();
  const totalPrice = unitPrice * quantity;

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.200"
      bg="white"
      shadow="sm"
      width="100%"
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        {/* Adicionar imagem do produto */}
        {product.image && (
          <Box mr={3} width="60px" height="60px" flexShrink={0}>
            <Image 
              src={product.image} 
              alt={product.name} 
              objectFit="cover" 
              width="100%" 
              height="100%" 
              borderRadius="md"
            />
          </Box>
        )}
        
        <VStack align="stretch" spacing={1} flex="1">
          <Text fontWeight="bold">{product.name}</Text>
          
          <Text fontSize="sm" color="gray.500">
            {formatCurrency(product.price)}
          </Text>
          
          {/* Mostrar os complementos selecionados */}
          {selectedOptions && selectedOptions.length > 0 && (
            <Box mt={1} pl={2} borderLeftWidth="1px" borderLeftColor="gray.300">
              <Flex fontSize="xs" color="gray.600" mb={1} wrap="wrap">
                <Text fontWeight="medium" mr={1}>Complementos:</Text>
                {selectedOptions.map((option, index) => (
                  <Text key={index} fontSize="xs" mb={0.5}>
                    {option.option.name}
                    {option.option.price > 0 && ` (+${formatCurrency(option.option.price)})`}
                    {index < selectedOptions.length - 1 ? ', ' : ''}
                  </Text>
                ))}
              </Flex>
            </Box>
          )}
          
          {/* Mostrar as notas se houver */}
          {notes && (
            <Text fontSize="xs" fontStyle="italic" color="gray.600" mt={1}>
              Obs: {notes}
            </Text>
          )}
        </VStack>
        
        <Text fontWeight="bold" minWidth="80px" textAlign="right">
          {formatCurrency(totalPrice)}
        </Text>
      </Flex>
      
      <Divider my={2} />
      
      <Flex justifyContent="space-between">
        <HStack>
          <IconButton
            aria-label="Diminuir quantidade"
            icon={<MinusIcon />}
            size="xs"
            onClick={onDecrement}
            colorScheme="blue"
            variant="ghost"
          />
          <Text fontWeight="medium">{quantity}</Text>
          <IconButton
            aria-label="Aumentar quantidade"
            icon={<AddIcon />}
            size="xs"
            onClick={onIncrement}
            colorScheme="blue"
            variant="ghost"
          />
        </HStack>
        
        <IconButton
          aria-label="Remover item"
          icon={<DeleteIcon />}
          size="xs"
          onClick={onRemove}
          colorScheme="red"
          variant="ghost"
        />
      </Flex>
      
      {onNotesChange && (
        <Box mt={2}>
          <Textarea
            placeholder="Alguma observação? Ex: sem cebola, etc."
            size="sm"
            value={notes || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
          />
        </Box>
      )}
    </Box>
  );
};

export default CartItem; 