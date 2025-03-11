import React, { useEffect, useState } from 'react';
import { Typography, Grid, Box, CircularProgress, Divider } from '@mui/material';
import { Category } from '../types/category';
import { Product } from '../types/product';
import { menuService } from '../services/menuService';
import ProductCard from './ProductCard';
import EmptyCategoryMessage from './EmptyCategoryMessage';
import { SimpleGrid } from '@chakra-ui/react';

interface CategoryProductsProps {
  category: Category;
  restaurantId: string;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

const CategoryProducts: React.FC<CategoryProductsProps> = ({ 
  category, 
  restaurantId,
  onAddToCart,
  onProductClick
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log(`Buscando produtos para categoria ${category.id} do restaurante ${restaurantId}`);
        const data = await menuService.getProductsByCategory(restaurantId, category.id);
        console.log('Produtos recebidos:', data);
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError('Não foi possível carregar os produtos desta categoria.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category.id, restaurantId]);

  // Adicionar o keyframe como uma regra de estilo global quando o componente montar
  useEffect(() => {
    // Criar o elemento style
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    // Adicionar ao head se ainda não existir
    if (!document.head.querySelector('style[data-spin-animation]')) {
      styleElement.setAttribute('data-spin-animation', 'true');
      document.head.appendChild(styleElement);
    }
    
    // Limpar quando o componente desmontar
    return () => {
      const existingStyle = document.head.querySelector('style[data-spin-animation]');
      if (existingStyle && document.querySelectorAll('.loading-spinner').length <= 1) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Filtrar apenas produtos desta categoria
  const categoryProducts = products.filter(product => product.categoryId === category.id);
  
  console.log(`CategoryProducts: Exibindo ${categoryProducts.length} produtos para a categoria ${category.id}`);
  
  if (categoryProducts.length === 0) {
    return <EmptyCategoryMessage />;
  }
  
  return (
    <Box sx={{ mb: 8 }} id={`category-${category.id}`}>
      <Box sx={{ 
        mb: 3,
        display: 'flex',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          fontWeight="bold"
          sx={{ 
            color: '#1a202c',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 60,
              height: 3,
              backgroundColor: '#3182ce',
              borderRadius: 1.5
            }
          }}
        >
          {category.name}
        </Typography>
        <Divider sx={{ ml: 3, flex: 1 }} />
      </Box>

      {category.description && (
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3, 
            color: '#4a5568',
            maxWidth: '800px'
          }}
        >
          {category.description}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#3182ce' }} />
        </Box>
      ) : error ? (
        <Box sx={{ 
          p: 4, 
          borderRadius: 2, 
          backgroundColor: '#FFF5F5', 
          color: '#E53E3E',
          border: '1px solid #FED7D7',
          mb: 4
        }}>
          <Typography>{error}</Typography>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {categoryProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductClick(product)} 
              onAddToCart={() => onAddToCart(product)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default CategoryProducts; 