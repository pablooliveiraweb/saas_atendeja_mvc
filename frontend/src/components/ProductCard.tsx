import React from 'react';
import { Box, Image, Text, Button, Flex, Stack, VStack, HStack } from '@chakra-ui/react';
import { Product } from '../types/product';

// Obter a URL base da API
// Primeiro tenta usar a variável de ambiente, depois tenta obter do servidor atual, ou usa uma URL fixa
const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Tentar obter a URL base do servidor atual
  const currentUrl = window.location.origin;
  
  // Se estamos em localhost:3000 (frontend), a API provavelmente está em localhost:3001 (backend)
  if (currentUrl.includes('localhost:3000')) {
    return 'http://localhost:3001';
  }
  
  // Caso contrário, usar a mesma origem
  return currentUrl;
};

const API_URL = getBaseUrl();
console.log('API_URL em ProductCard:', API_URL);

// Função para garantir que a URL da imagem tenha o caminho completo
const getFullImageUrl = (path: string | undefined): string | null => {
  if (!path) return null;
  
  // Se já começa com http:// ou https://, já é uma URL completa
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Se começa com data:, é uma URL de dados (base64)
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Garantir que o caminho comece com /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Retornar a URL completa
  return `${API_URL}${normalizedPath}`;
};

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onAddToCart: () => void;
  isRestaurantOpen?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  onAddToCart,
  isRestaurantOpen = true // Por padrão, assume-se que o restaurante está aberto
}) => {
  // Garantir que a imagem tenha o caminho completo
  const imageUrl = product.image ? getFullImageUrl(product.image) : null;
  
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
      {imageUrl ? (
        <Box
          width="120px"
          minWidth="120px"
          height="120px"
          overflow="hidden"
          position="relative"
        >
          <Image
            src={imageUrl}
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
            isDisabled={!isRestaurantOpen}
            _disabled={{
              opacity: 0.7,
              cursor: 'not-allowed',
              bg: 'gray.400',
              _hover: {
                bg: 'gray.400',
                transform: 'none'
              }
            }}
          >
            {isRestaurantOpen ? 'Adicionar à sacola' : 'Restaurante fechado'}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ProductCard; 