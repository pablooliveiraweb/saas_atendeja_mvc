import React from 'react';
import { Box, Image, Text, Button, Flex, Stack, VStack, HStack } from '@chakra-ui/react';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onAddToCart }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      height="100%"
      minHeight="120px"
      minWidth="280px"
      width="100%"
      display="flex"
      flexDirection="row"
      textAlign="left"
      cursor="pointer"
      onClick={() => onClick(product)}
    >
      {product.image ? (
        <Box
          width="120px"
          minWidth="120px"
          height="120px"
          overflow="hidden"
          position="relative"
        >
          <Image
            src={product.image}
            alt={product.name}
            width="100%"
            height="100%"
            objectFit="cover"
            transition="transform 0.5s"
            _hover={{ transform: 'scale(1.05)' }}
          />
        </Box>
      ) : (
        <Box
          width="120px"
          minWidth="120px"
          height="120px"
          bg="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="gray.400" fontSize="sm">Sem imagem</Text>
        </Box>
      )}

      <Flex 
        p={4} 
        flexGrow={1}
        justifyContent="space-between"
        flexDirection="column"
        alignItems="flex-start"
        width="calc(100% - 120px)"
      >
        <Box width="100%">
          <Text 
            fontWeight="bold" 
            fontSize="md"
            mb={2}
            noOfLines={1}
          >
            {product.name}
          </Text>
          
          {product.description && (
            <Text 
              color="gray.600" 
              fontSize="sm" 
              noOfLines={2}
              mb={2}
            >
              {product.description}
            </Text>
          )}
        </Box>

        <Flex 
          width="100%" 
          justifyContent="space-between" 
          alignItems="center"
          mt={2}
        >
          <Text 
            fontWeight="bold" 
            fontSize="md" 
            color="blue.500"
          >
            {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(product.price)}
          </Text>
          
          <Button
            colorScheme="blue"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
          >
            Adicionar
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ProductCard; 