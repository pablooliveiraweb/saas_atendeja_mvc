import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  Button,
  Flex,
  Badge,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  IconButton,
  useToast,
  Radio,
  RadioGroup,
  Stack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerFooter,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Spinner,
  useColorModeValue,
  FormErrorMessage,
  Select,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../types/product';
import { Category } from '../../types/category';
import { menuService, CustomerOrderData } from '../../services/menuService';
import { restaurantService } from '../../services/restaurantService';
import { useForm } from 'react-hook-form';
import ProductCard from '../../components/ProductCard';
import CartItem from '../../components/CartItem';
import EmptyCategoryMessage from '../../components/EmptyCategoryMessage';
import MenuHeader from '../../components/MenuHeader';
import CategoryProducts from '../../components/CategoryProducts';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { customersService } from '../../services/customersService';
import api from '../../services/api';

// Tipos para o formulário de cliente
interface CustomerFormData {
  name: string;
  phone: string;
  phoneFormatted?: string;
}

// Tipos para o formulário de entrega
interface DeliveryFormData {
  deliveryMethod: 'pickup' | 'delivery' | 'dineIn';
  address?: string;
  complement?: string;
  reference?: string;
}

// Componente principal do cardápio digital
const Menu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  
  const { 
    items, 
    addItem, 
    removeItem, 
    updateItemQuantity, 
    totalItems, 
    totalPrice,
    setRestaurantId: setCartRestaurantId,
    clearCart
  } = useCart();
  
  const navigate = useNavigate();
  const toast = useToast();
  
  // Modais e drawers
  const { 
    isOpen: isProductModalOpen, 
    onOpen: onProductModalOpen, 
    onClose: onProductModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isCartDrawerOpen, 
    onOpen: onCartDrawerOpen, 
    onClose: onCartDrawerClose 
  } = useDisclosure();
  
  const { 
    isOpen: isCheckoutModalOpen, 
    onOpen: onCheckoutModalOpen, 
    onClose: onCheckoutModalClose 
  } = useDisclosure();
  
  // Formulários
  const { 
    register: registerCustomer, 
    handleSubmit: handleSubmitCustomer, 
    formState: { errors: customerErrors } 
  } = useForm<CustomerFormData>();
  
  const { 
    register: registerDelivery, 
    handleSubmit: handleSubmitDelivery, 
    formState: { errors: deliveryErrors },
    watch: watchDelivery
  } = useForm<DeliveryFormData>({
    defaultValues: {
      deliveryMethod: 'pickup'
    }
  });
  
  const deliveryMethod = watchDelivery('deliveryMethod');
  
  // Cores
  const menuBgColor = '#ffffff';
  const menuTextColor = '#333333';
  const menuSecondaryTextColor = '#666666';
  const menuAccentColor = '#3182ce';
  const menuHeaderBgColor = '#f8f9fa';
  
  // Estado para armazenar usuários que já fizeram pedidos
  const [previousCustomers, setPreviousCustomers] = useState<{name: string, phone: string}[]>([]);
  const [foundCustomer, setFoundCustomer] = useState<{name: string, phone: string} | null>(null);
  
  // Estado para o pedido atual
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [customerLoggedIn, setCustomerLoggedIn] = useState(false);
  
  // Hook para persistência de dados do cliente
  const [savedCustomer, setSavedCustomer] = useLocalStorage<{name: string, phone: string, orders: string[]} | null>(
    'customerData',
    null
  );
  
  // Adicionar este estado depois dos outros estados existentes
  // Estado para armazenar os dados do cliente durante o checkout
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData | null>(null);
  
  // Buscar dados do restaurante e produtos
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        
        // Buscar informações do restaurante pelo slug
        const restaurant = await restaurantService.getBySlug(slug);
        setRestaurantId(restaurant.id);
        setRestaurantInfo(restaurant);
        setCartRestaurantId(restaurant.id);
        
        // Buscar categorias
        const categoriesData = await menuService.getCategories(restaurant.id);
        const activeCategories = categoriesData.filter((cat: Category) => cat.isActive);
        const sortedCategories = activeCategories.sort((a: Category, b: Category) => (a.order || 0) - (b.order || 0));
        setCategories(sortedCategories);
        
        // Buscar produtos
        const productsData = await menuService.getProducts(restaurant.id);
        console.log('Produtos carregados da API:', productsData);
        
        if (productsData && productsData.length > 0) {
          const activeProducts = productsData.filter((prod: Product) => 
            prod.isActive && prod.isAvailable
          );
          
          // Verificar se há produtos sem categoryId e atribuir uma categoria default
          const defaultCategoryId = sortedCategories.length > 0 ? sortedCategories[0].id : null;
          
          const processedProducts = activeProducts.map((product: Product) => {
            if (!product.categoryId && defaultCategoryId) {
              console.log(`Atribuindo categoria temporária (${defaultCategoryId}) para produto: ${product.name}`);
              return { ...product, categoryId: defaultCategoryId };
            }
            return product;
          });
          
          console.log('Produtos processados:', processedProducts.map(p => `${p.name} (categoria: ${p.categoryId})`));
          setProducts(processedProducts);
        } else {
          console.error('Nenhum produto retornado da API ou array vazio');
          setProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro ao carregar cardápio',
          description: 'Não foi possível carregar o cardápio. Por favor, tente novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [slug, setCartRestaurantId, toast]);
  
  // Adicione este console.log para depuração
  useEffect(() => {
    if (products.length > 0) {
      console.log('Produtos carregados:', products);
    }
  }, [products]);
  
  // Abrir modal de produto
  const handleOpenProductModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setNotes('');
    onProductModalOpen();
  };
  
  // Adicionar produto ao carrinho
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    addItem({
      product: selectedProduct,
      quantity,
      notes: notes.trim() || undefined
    });
    
    toast({
      title: 'Produto adicionado',
      description: `${selectedProduct.name} foi adicionado à sacola`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    
    onProductModalClose();
  };
  
  // Iniciar processo de checkout
  const handleStartCheckout = () => {
    setCheckoutStep(1);
    onCheckoutModalOpen();
  };
  
  // Verificar se o cliente já existe quando digita o telefone
  const checkExistingCustomer = (phone: string) => {
    const customer = previousCustomers.find(c => c.phone === phone);
    if (customer) {
      setFoundCustomer(customer);
      // Preencher automaticamente o nome se o telefone corresponder
      const nameInput = document.getElementById('customer-name') as HTMLInputElement;
      if (nameInput && !nameInput.value) {
        nameInput.value = customer.name;
        // Disparar evento para atualizar react-hook-form
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      toast({
        title: 'Cliente identificado',
        description: `Bem-vindo novamente, ${customer.name}!`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Verificar se o cliente tem pedidos anteriores
      checkExistingOrder(phone);
    } else {
      setFoundCustomer(null);
      
      // Verificar se existe no localStorage
      if (savedCustomer && savedCustomer.phone === phone) {
        setFoundCustomer({name: savedCustomer.name, phone: savedCustomer.phone});
        
        // Preencher automaticamente o nome se o telefone corresponder
        const nameInput = document.getElementById('customer-name') as HTMLInputElement;
        if (nameInput && !nameInput.value) {
          nameInput.value = savedCustomer.name;
          // Disparar evento para atualizar react-hook-form
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        toast({
          title: 'Cliente identificado',
          description: `Bem-vindo novamente, ${savedCustomer.name}!`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });

        // Verificar se o cliente tem pedidos anteriores
        checkExistingOrder(phone);
      }
    }
  };
  
  // Verificar se o cliente já tem um pedido em andamento
  const checkExistingOrder = useCallback((phone: string) => {
    if (savedCustomer && savedCustomer.phone === phone && savedCustomer.orders && savedCustomer.orders.length > 0) {
      // Mostrar informação sobre pedidos anteriores
      const lastOrderId = savedCustomer.orders[savedCustomer.orders.length - 1];
      
      toast({
        title: 'Pedidos anteriores encontrados',
        description: `Você já realizou ${savedCustomer.orders.length} pedido(s) conosco.`,
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
      
      setCustomerLoggedIn(true);
    }
  }, [savedCustomer, toast]);
  
  // Salvar informações do cliente após finalizar pedido
  const saveCustomerInfo = (customerData: {name: string, phone: string}) => {
    if (!previousCustomers.some(c => c.phone === customerData.phone)) {
      setPreviousCustomers(prev => [...prev, customerData]);
      console.log('Cliente salvo localmente:', customerData);
      
      // Tentar salvar o cliente no banco de dados sem interromper o fluxo principal
      try {
        const saveToDatabase = async () => {
          try {
            // Verificar se temos o ID do restaurante correto
            if (!restaurantId) {
              console.error('ID do restaurante não disponível, não é possível salvar o cliente');
              return;
            }
            
            console.log('Usando restaurante ID:', restaurantId, 'para salvar o cliente:', customerData);
            
            // Formatar o número de telefone (remover caracteres não numéricos)
            const formattedPhone = customerData.phone.replace(/\D/g, '');
            const phoneWithPrefix = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;
            
            // Criar cliente diretamente com os dados corretos
            const customerToCreate = {
              name: customerData.name || 'Cliente',
              email: `${phoneWithPrefix.substring(0, 6)}@cliente.temp`,
              phone: phoneWithPrefix,
              restaurantId: restaurantId // Usar o ID do restaurante atual
            };
            
            console.log('Dados do cliente para criação:', customerToCreate);
            
            // Usar a API diretamente para evitar problemas de validação
            const response = await api.post(`/restaurants/${restaurantId}/customers`, {
              name: customerToCreate.name,
              email: customerToCreate.email,
              phone: customerToCreate.phone
            });
            
            console.log('Cliente salvo no banco de dados com sucesso:', response.data);
          } catch (error) {
            console.error('Erro ao salvar cliente no banco:', error);
            // Não interromper o fluxo principal
          }
        };
        
        saveToDatabase();
      } catch (error) {
        console.error('Erro ao iniciar salvamento do cliente:', error);
      }
    }
  };
  
  // Atualizar processamento do pedido para salvar o cliente
  const handleDeliveryFormSubmitWithSave = async (deliveryData: DeliveryFormData) => {
    try {
      // Usar dados do cliente salvos no estado em vez de acessar o formulário
      if (customerFormData) {
        // Salvar dados do cliente
        saveCustomerInfo({
          name: customerFormData.name, 
          phone: customerFormData.phone
        });
        
        // Continuar com o processamento normal do pedido
        await onDeliveryFormSubmit(deliveryData);
      } else {
        throw new Error('Dados do cliente não encontrados');
      }
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      toast({
        title: 'Erro ao finalizar pedido',
        description: 'Não foi possível finalizar seu pedido. Por favor, tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };
  
  // Atualizar a função onCustomerFormSubmit para salvar os dados no estado
  const onCustomerFormSubmit = (data: CustomerFormData) => {
    setCustomerFormData(data);
    setCheckoutStep(2);
    
    // Formatar o número de telefone para incluir o prefixo 55 se não estiver presente
    const formattedPhone = data.phone.replace(/\D/g, '');
    const phoneWithPrefix = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;
    
    // Atualizar os dados do formulário com o número formatado para uso interno
    // Mantendo o formato original para exibição no formulário
    setCustomerFormData({
      ...data,
      phoneFormatted: phoneWithPrefix
    });
  };
  
  // Processar segunda etapa do checkout (método de entrega e endereço)
  const onDeliveryFormSubmit = async (deliveryData: DeliveryFormData) => {
    try {
      if (!customerFormData) {
        throw new Error('Dados do cliente não encontrados');
      }
      
      // Preparar itens do pedido
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes
      }));
      
      // Criar objeto de pedido
      const orderData: CustomerOrderData = {
        customerName: customerFormData.name,
        customerPhone: customerFormData.phoneFormatted || customerFormData.phone.replace(/\D/g, ''),
        items: orderItems,
        deliveryMethod: deliveryData.deliveryMethod,
        deliveryAddress: deliveryData.deliveryMethod === 'delivery' 
          ? `${deliveryData.address}, ${deliveryData.complement || ''} - Ref: ${deliveryData.reference || ''}` 
          : undefined
      };
      
      // Salvar nome e telefone no localStorage para o modo de demonstração
      localStorage.setItem('customerName', customerFormData.name);
      localStorage.setItem('customerPhone', customerFormData.phoneFormatted || customerFormData.phone.replace(/\D/g, ''));
      
      // Mostrar loading
      toast({
        title: 'Processando pedido...',
        description: 'Estamos enviando seu pedido, aguarde um momento.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Enviar pedido para o backend
      if (!restaurantId) {
        throw new Error('ID do restaurante não encontrado');
      }
      
      const response = await menuService.createOrder(restaurantId, orderData);
      const orderId = response.id;
      
      // Salvar informações do cliente e pedido
      const customerData = {
        name: customerFormData.name,
        phone: customerFormData.phoneFormatted || customerFormData.phone.replace(/\D/g, ''),
        orders: savedCustomer?.orders ? [...savedCustomer.orders, orderId] : [orderId]
      };
      
      // Atualizar LocalStorage
      setSavedCustomer(customerData);
      setCustomerLoggedIn(true);
      
      // Atualizar estado atual do pedido
      setCurrentOrderId(orderId);
      
      // Limpar carrinho
      clearCart();
      
      // Fechar modal de checkout
      onCheckoutModalClose();
      
      // Mostrar mensagem de sucesso
      toast({
        title: 'Pedido realizado com sucesso!',
        description: `Seu pedido #${orderId} foi recebido e está sendo processado.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirecionar para página de acompanhamento do pedido
      navigate(`/order/${orderId}`);
      
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      
      // Mensagem de erro mais detalhada para o usuário
      toast({
        title: 'Erro ao finalizar pedido',
        description: error instanceof Error ? error.message : 'Não foi possível finalizar seu pedido. Verifique sua conexão e tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };
  
  // Renderizar produtos por categoria
  const renderProductsByCategory = (categoryId: string) => {
    console.log(`Renderizando produtos para categoria: "${categoryId}" (tipo: ${typeof categoryId})`);
    
    // Verificar se há produtos carregados
    if (!products || products.length === 0) {
      console.log('Nenhum produto disponível para renderizar');
      return <EmptyCategoryMessage />;
    }
    
    // Log detalhado dos produtos e suas categorias
    console.log(`Total de ${products.length} produtos carregados:`);
    products.forEach(product => {
      console.log(`- ${product.name}: categoryId="${product.categoryId}" (tipo: ${typeof product.categoryId})`);
    });
    
    // Filtragem mais robusta com normalização de tipo
    const categoryProducts = products.filter(product => {
      // Verificar se o produto tem categoryId
      if (!product.categoryId) {
        console.log(`Produto ${product.name} não tem categoryId definido`);
        return false;
      }
      
      // Normalizar ambos os IDs para string para comparação precisa
      const productCategoryIdStr = String(product.categoryId).trim();
      const currentCategoryIdStr = String(categoryId).trim();
      
      const matches = productCategoryIdStr === currentCategoryIdStr;
      
      if (matches) {
        console.log(`✓ Produto "${product.name}" CORRESPONDE à categoria ${categoryId}`);
      } else {
        console.log(`✗ Produto "${product.name}" NÃO corresponde à categoria ${categoryId}`);
        console.log(`  - categoryId do produto: "${productCategoryIdStr}"`);
        console.log(`  - categoryId atual: "${currentCategoryIdStr}"`);
      }
      
      return matches;
    });
    
    console.log(`Encontrados ${categoryProducts.length} produtos para a categoria ${categoryId}`);
    
    // Se não houver produtos nesta categoria
    if (categoryProducts.length === 0) {
      return <EmptyCategoryMessage />;
    }
    
    // Renderizar os produtos da categoria - Com espaçamento e layout fluido
    return (
      <SimpleGrid 
        columns={{ base: 1, md: 2, lg: 3 }} 
        spacing={5} 
        width="100%"
      >
        {categoryProducts.map(product => (
          <Box 
            key={product.id}
            width="100%"
            height="100%"
          >
            <ProductCard 
              product={product} 
              onClick={handleOpenProductModal} 
              onAddToCart={() => {
                setSelectedProduct(product);
                setQuantity(1);
                addItem({
                  product,
                  quantity: 1
                });
                toast({
                  title: 'Produto adicionado',
                  description: `${product.name} foi adicionado à sacola`,
                  status: 'success',
                  duration: 2000,
                  isClosable: true,
                });
              }}
            />
          </Box>
        ))}
      </SimpleGrid>
    );
  };
  
  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  return (
    <Box bg={menuBgColor} minH="100vh" display="flex" flexDirection="column" alignItems="center" position="relative">
      {/* Menu Header */}
      {restaurantInfo && (
        <Box width="100%" position="relative" zIndex={1}>
          <MenuHeader restaurant={restaurantInfo} />
        </Box>
      )}
      
      <Container maxWidth="container.xl" centerContent padding="0" width="100%" position="relative" zIndex={1}>
        <Box 
          sx={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 5, 
            backgroundColor: menuBgColor,
            pt: 2,
            pb: 2,
            borderBottom: '1px solid #edf2f7',
            mb: 4,
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'center',
              overflowX: 'auto', 
              whiteSpace: 'nowrap',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '10px',
              }
            }}
          >
            {categories.map((category, index) => (
              <Button
                key={category.id}
                onClick={() => {
                  const element = document.getElementById(`category-${category.id}`);
                  if (element) {
                    const yOffset = -80; // Ajuste conforme necessário
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                sx={{
                  mr: 2,
                  mb: 1,
                  px: 3,
                  py: 1.5,
                  borderRadius: '30px',
                  backgroundColor: 'white',
                  color: menuTextColor,
                  fontWeight: 'medium',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#f5f8fa',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  },
                  whiteSpace: 'nowrap'
                }}
              >
                {category.name}
              </Button>
            ))}
          </Box>
        </Box>

        <Box width="95%" maxWidth="1200px" mx="auto" textAlign="center">
          {categories.map(category => (
            <Box key={category.id} id={`category-${category.id}`} sx={{ scrollMarginTop: '100px', mb: 8 }}>
              <Box 
                sx={{ 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text 
                  fontSize="2xl" 
                  fontWeight="bold"
                  textAlign="center"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '3px',
                    backgroundColor: menuAccentColor,
                    borderRadius: '1.5px'
                  }}
                >
                  {category.name}
                </Text>
              </Box>

              {category.description && (
                <Text 
                  textAlign="center" 
                  color={menuSecondaryTextColor} 
                  mb={6}
                  maxWidth="800px"
                  mx="auto"
                >
                  {category.description}
                </Text>
              )}

              {renderProductsByCategory(category.id)}
            </Box>
          ))}
        </Box>
      </Container>
      
      {/* Modal customizada para detalhes do produto */}
      <CustomModal isOpen={isProductModalOpen} onClose={onProductModalClose}>
        <Box>
          {selectedProduct?.image && (
            <Box position="relative" height="200px">
              <Image
                src={selectedProduct.image}
                alt={selectedProduct.name}
                objectFit="cover"
                width="100%"
                height="100%"
              />
            </Box>
          )}
          
          <IconButton
            aria-label="Fechar"
            icon={<Box as="span" fontSize="lg" fontWeight="bold" color="white">✕</Box>}
            position="absolute"
            right="10px"
            top="10px"
            size="sm"
            borderRadius="full"
            bg="transparent"
            _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
            onClick={onProductModalClose}
            zIndex={1}
          />
          
          <Box p={4}>
            <Heading as="h3" fontSize="xl" mb={2}>
              {selectedProduct?.name}
            </Heading>
            
            {selectedProduct?.description && (
              <Text mb={4} color={menuSecondaryTextColor}>
                {selectedProduct.description}
              </Text>
            )}
            
            <Text fontWeight="bold" fontSize="xl" mb={4} color={menuAccentColor}>
              {selectedProduct && new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(selectedProduct.price)}
            </Text>
            
            <FormControl mb={4}>
              <FormLabel fontWeight="medium">Quantidade</FormLabel>
              <HStack maxW="200px" spacing={3}>
                <IconButton
                  aria-label="Diminuir quantidade"
                  icon={<MinusIcon />}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  isDisabled={quantity <= 1}
                  colorScheme="blue"
                  variant="solid"
                  size="md"
                  boxShadow="sm"
                  borderRadius="md"
                />
                <NumberInput 
                  min={1} 
                  max={20} 
                  value={quantity}
                  onChange={(_, value) => setQuantity(value)}
                  size="md"
                  flex="1"
                >
                  <NumberInputField borderRadius="md" textAlign="center" />
                </NumberInput>
                <IconButton
                  aria-label="Aumentar quantidade"
                  icon={<AddIcon />}
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  isDisabled={quantity >= 20}
                  colorScheme="blue"
                  variant="solid"
                  size="md"
                  boxShadow="sm"
                  borderRadius="md"
                />
              </HStack>
            </FormControl>
            
            <FormControl width="100%">
              <FormLabel fontWeight="medium">Observações</FormLabel>
              <Textarea 
                placeholder="Ex: Sem cebola, bem passado, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                borderRadius="md"
                rows={3}
                width="100%"
                resize="vertical"
                borderColor="gray.300"
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
              />
            </FormControl>
          </Box>
          
          <Flex 
            borderTop="1px solid" 
            borderColor="gray.100" 
            p={4} 
            justifyContent="flex-end"
            width="100%"
          >
            <Button 
              variant="solid" 
              mr={3} 
              onClick={onProductModalClose}
              size="md"
              fontWeight="medium"
              borderRadius="md"
              height="48px"
              bg="gray.100"
              color="gray.700"
              boxShadow="sm"
              _hover={{ 
                bg: 'gray.200', 
                transform: 'translateY(-1px)',
                boxShadow: 'md' 
              }}
              _active={{
                bg: 'gray.300',
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleAddToCart}
              size="md"
              fontWeight="bold"
              px={8}
              borderRadius="md"
              boxShadow="sm"
              bgGradient="linear(to-r, blue.500, blue.600)"
              color="white"
              height="48px"
              _hover={{ 
                transform: 'translateY(-2px)',
                boxShadow: 'md',
                bgGradient: "linear(to-r, blue.600, blue.700)"
              }}
              _active={{
                transform: 'translateY(0)',
                boxShadow: 'sm',
                bgGradient: "linear(to-r, blue.700, blue.800)"
              }}
              transition="all 0.2s"
            >
              Adicionar à sacola
            </Button>
          </Flex>
        </Box>
      </CustomModal>
      
      {/* Drawer do carrinho */}
      <CustomDrawer isOpen={isCartDrawerOpen} onClose={onCartDrawerClose}>
        <Box width="100%" height="100%" maxWidth="450px" bg="white" boxShadow="0 4px 24px rgba(0, 0, 0, 0.3)" borderTopLeftRadius="md" borderBottomLeftRadius="md">
          <Flex justifyContent="space-between" alignItems="center" p={4} borderBottom="1px solid" borderColor="gray.200">
            <Text fontWeight="bold" fontSize="lg" color={menuTextColor}>
              Sua Sacola ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
            </Text>
            <IconButton
              aria-label="Fechar"
              icon={<Box as="span" fontSize="md">✕</Box>}
              size="sm"
              borderRadius="full"
              bg="gray.100"
              onClick={onCartDrawerClose}
            />
          </Flex>
          
          <Box p={4} height="calc(100% - 160px)" overflowY="auto">
            {items.length === 0 ? (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                h="100%"
                py={8}
              >
                <Text fontSize="lg" mb={4} color={menuSecondaryTextColor}>
                  Sua sacola está vazia
                </Text>
                <Button 
                  colorScheme="blue" 
                  variant="outline" 
                  onClick={onCartDrawerClose}
                  boxShadow="sm"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                  transition="all 0.2s"
                >
                  Ver cardápio
                </Button>
              </Flex>
            ) : (
              <VStack spacing={4} align="stretch" divider={<Divider />}>
                {items.map((item) => (
                  <CartItem
                    key={item.product.id}
                    product={item.product}
                    quantity={item.quantity}
                    notes={item.notes}
                    onIncrement={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                    onDecrement={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                    onRemove={() => removeItem(item.product.id)}
                  />
                ))}
              </VStack>
            )}
          </Box>
          
          <Box 
            borderTop="1px solid" 
            borderColor="gray.100" 
            p={4}
            bg="white"
            width="100%"
            position="absolute"
            bottom="0"
            left="0"
          >
            <VStack width="100%" spacing={4}>
              <Flex justify="space-between" width="100%">
                <Text fontWeight="bold" color={menuTextColor} fontSize="lg">Total:</Text>
                <Text fontWeight="bold" color={menuAccentColor} fontSize="lg">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(totalPrice)}
                </Text>
              </Flex>
              <Button 
                colorScheme="blue" 
                width="100%" 
                isDisabled={items.length === 0}
                onClick={() => {
                  onCartDrawerClose();
                  handleStartCheckout();
                }}
                height="48px"
                fontWeight="bold"
                boxShadow="sm"
                bgGradient="linear(to-r, blue.500, blue.600)"
                _hover={{ 
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  bgGradient: "linear(to-r, blue.600, blue.700)"
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'sm',
                  bgGradient: "linear(to-r, blue.700, blue.800)"
                }}
                transition="all 0.2s"
              >
                Finalizar Pedido
              </Button>
            </VStack>
          </Box>
        </Box>
      </CustomDrawer>
      
      {/* Modal de checkout */}
      <CustomCheckoutModal isOpen={isCheckoutModalOpen} onClose={onCheckoutModalClose}>
        <Box 
          bg="white" 
          borderRadius="md" 
          maxWidth="550px" 
          width="95%" 
          maxHeight="90vh" 
          overflow="auto" 
          position="relative"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
        >
          <Flex 
            justifyContent="space-between" 
            alignItems="center" 
            borderBottom="1px solid" 
            borderColor="gray.200"
            p={4}
          >
            <Heading fontSize="xl" fontWeight="bold" color={menuTextColor}>
              {checkoutStep === 1 ? 'Seus Dados' : 'Método de Entrega'}
            </Heading>
            <IconButton
              aria-label="Fechar"
              icon={<Box as="span" fontSize="md">✕</Box>}
              size="sm"
              borderRadius="full"
              bg="gray.100"
              onClick={onCheckoutModalClose}
            />
          </Flex>
          
          <Box p={4}>
            {checkoutStep === 1 ? (
              <form id="customer-form" onSubmit={handleSubmitCustomer(onCustomerFormSubmit)}>
                <VStack spacing={4}>
                  <FormControl isRequired isInvalid={!!customerErrors.name}>
                    <FormLabel color={menuTextColor}>Nome</FormLabel>
                    <Input 
                      id="customer-name"
                      {...registerCustomer('name', { required: 'Nome é obrigatório' })}
                      placeholder="Seu nome completo"
                      bg="white"
                    />
                    <FormErrorMessage>
                      {customerErrors.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={!!customerErrors.phone}>
                    <FormLabel color={menuTextColor}>Telefone</FormLabel>
                    <Input 
                      {...registerCustomer('phone', { 
                        required: 'Telefone é obrigatório',
                        pattern: {
                          value: /^\(\d{2}\) \d{5}-\d{4}$/,
                          message: 'Formato inválido. Use (99) 99999-9999'
                        }
                      })}
                      placeholder="(99) 99999-9999"
                      bg="white"
                      onKeyUp={(e) => {
                        const input = e.target as HTMLInputElement;
                        let value = input.value.replace(/\D/g, '');
                        
                        // Limitar a 11 dígitos (DDD + número)
                        if (value.length > 11) {
                          value = value.substring(0, 11);
                        }
                        
                        // Aplicar máscara conforme o usuário digita
                        if (value.length <= 2) {
                          input.value = value.length > 0 ? `(${value}` : value;
                        } else if (value.length <= 7) {
                          input.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                        } else {
                          input.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
                        }
                        
                        // Verificar cliente existente quando o número estiver completo
                        if (input.value.match(/^\(\d{2}\) \d{5}-\d{4}$/)) {
                          checkExistingCustomer(input.value);
                        }
                      }}
                    />
                    <FormErrorMessage>
                      {customerErrors.phone?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  {foundCustomer && (
                    <Box 
                      p={3} 
                      bg="blue.50" 
                      borderRadius="md" 
                      borderLeft="4px solid" 
                      borderColor="blue.500"
                    >
                      <Text fontSize="sm">
                        Cliente identificado: <Text as="span" fontWeight="bold">{foundCustomer.name}</Text>
                      </Text>
                      {savedCustomer && savedCustomer.orders && savedCustomer.orders.length > 0 && (
                        <Text fontSize="sm" mt={1}>
                          {savedCustomer.orders.length} pedido(s) realizado(s) anteriormente
                        </Text>
                      )}
                    </Box>
                  )}
                </VStack>
              </form>
            ) : (
              <form id="delivery-form" onSubmit={handleSubmitDelivery(handleDeliveryFormSubmitWithSave)}>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel color={menuTextColor}>Método de Entrega</FormLabel>
                    <RadioGroup>
                      <Stack direction="column" spacing={4}>
                        <Radio 
                          value="pickup" 
                          {...registerDelivery('deliveryMethod')}
                          sx={{
                            borderWidth: "1px",
                            borderRadius: "md",
                            p: 3,
                            _checked: {
                              bg: "blue.50",
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce"
                            }
                          }}
                        >
                          <Box>
                            <Text fontWeight="bold">Retirada no local</Text>
                            <Text fontSize="sm" color="gray.600">Busque seu pedido no estabelecimento</Text>
                          </Box>
                        </Radio>
                        <Radio 
                          value="delivery" 
                          {...registerDelivery('deliveryMethod')}
                          sx={{
                            borderWidth: "1px",
                            borderRadius: "md",
                            p: 3,
                            _checked: {
                              bg: "blue.50",
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce"
                            }
                          }}
                        >
                          <Box>
                            <Text fontWeight="bold">Entrega</Text>
                            <Text fontSize="sm" color="gray.600">Receba seu pedido no endereço informado</Text>
                          </Box>
                        </Radio>
                        <Radio 
                          value="dineIn" 
                          {...registerDelivery('deliveryMethod')}
                          sx={{
                            borderWidth: "1px",
                            borderRadius: "md",
                            p: 3,
                            _checked: {
                              bg: "blue.50",
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce"
                            }
                          }}
                        >
                          <Box>
                            <Text fontWeight="bold">Consumir no local</Text>
                            <Text fontSize="sm" color="gray.600">Para consumo no próprio estabelecimento</Text>
                          </Box>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                  
                  {deliveryMethod === 'delivery' && (
                    <>
                      <FormControl mb={3}>
                        <FormLabel color={menuTextColor}>CEP</FormLabel>
                        <Flex>
                          <Input 
                            placeholder="00000-000"
                            id="cep-input"
                            onKeyUp={(e) => {
                              const input = e.target as HTMLInputElement;
                              let value = input.value.replace(/\D/g, '');
                              if (value.length > 0) {
                                const matches = value.match(new RegExp('.{1,8}'));
                                value = matches ? matches[0] : value.substring(0, 8);
                                if (value.length <= 5) {
                                  input.value = value;
                                } else {
                                  input.value = `${value.slice(0, 5)}-${value.slice(5, 8)}`;
                                }
                              }
                            }}
                            onBlur={async (e) => {
                              const cep = e.target.value.replace(/\D/g, '');
                              if (cep.length === 8) {
                                try {
                                  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                                  const data = await response.json();
                                  if (!data.erro) {
                                    const addressInput = document.getElementById('address-input') as HTMLInputElement;
                                    if (addressInput) {
                                      // Preservar o que já está no campo de endereço, se preenchido
                                      const currentAddress = addressInput.value.trim();
                                      
                                      // Se o endereço já estiver preenchido, perguntar antes de substituir
                                      if (currentAddress && currentAddress.length > 0) {
                                        const confirmed = window.confirm(
                                          `Deseja substituir o endereço atual pelo encontrado a partir do CEP?\n\nEndereço atual: ${currentAddress}\nEndereço do CEP: ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
                                        );
                                        
                                        if (!confirmed) {
                                          return; // Manter o endereço atual
                                        }
                                      }
                                      
                                      // Atualizar o endereço com o novo
                                      addressInput.value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                                      
                                      // Atualizar o valor no formulário
                                      const event = new Event('input', { bubbles: true });
                                      addressInput.dispatchEvent(event);
                                    }
                                  }
                                } catch (error) {
                                  console.error('Erro ao buscar CEP:', error);
                                }
                              }
                            }}
                            mr={2}
                          />
                          <Button 
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  async (position) => {
                                    try {
                                      const { latitude, longitude } = position.coords;
                                      
                                      // Primeiro obter endereço usando OpenStreetMap
                                      const geoResponse = await fetch(
                                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                                      );
                                      const geoData = await geoResponse.json();
                                      
                                      // Formatar o endereço sem CEP inicialmente
                                      let address = '';
                                      if (geoData.address) {
                                        address = `${geoData.address.road || ''}, ${geoData.address.house_number || ''}, ${geoData.address.suburb || ''}, ${geoData.address.city || ''} - ${geoData.address.state || ''}`;
                                      }
                                      
                                      // Tentar obter o CEP usando as coordenadas
                                      let cep = '';
                                      try {
                                        // Usar um serviço que retorna CEP baseado em coordenadas
                                        // Este é um exemplo, pode ser necessário adaptar para um serviço real
                                        const cepResponse = await fetch(
                                          `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=65fbeef32df4e239254099kex6e53a5`
                                        );
                                        const cepData = await cepResponse.json();
                                        
                                        // Tentar extrair o CEP/código postal
                                        if (cepData && cepData.address && cepData.address.postcode) {
                                          cep = cepData.address.postcode;
                                          // Atualizar o campo do CEP
                                          const cepInput = document.getElementById('cep-input') as HTMLInputElement;
                                          if (cepInput) {
                                            // Formatar o CEP (se for um CEP brasileiro)
                                            const cepFormatted = cep.replace(/(\d{5})(\d{3})/, "$1-$2");
                                            cepInput.value = cepFormatted;
                                            
                                            // Disparar evento para atualizar o formulário
                                            const event = new Event('input', { bubbles: true });
                                            cepInput.dispatchEvent(event);
                                          }
                                        }
                                      } catch (cepError) {
                                        console.error('Erro ao buscar CEP pelas coordenadas:', cepError);
                                      }
                                      
                                      // Atualizar campo de endereço
                                      const addressInput = document.getElementById('address-input') as HTMLInputElement;
                                      if (addressInput) {
                                        addressInput.value = address;
                                        
                                        // Atualizar o valor no formulário
                                        const event = new Event('input', { bubbles: true });
                                        addressInput.dispatchEvent(event);
                                      }
                                    } catch (error) {
                                      console.error('Erro ao obter localização:', error);
                                      toast({
                                        title: 'Erro',
                                        description: 'Não foi possível obter sua localização atual.',
                                        status: 'error',
                                        duration: 3000,
                                        isClosable: true,
                                      });
                                    }
                                  },
                                  (error) => {
                                    console.error('Erro de geolocalização:', error);
                                    toast({
                                      title: 'Erro',
                                      description: 'Não foi possível acessar sua localização.',
                                      status: 'error',
                                      duration: 3000,
                                      isClosable: true,
                                    });
                                  }
                                );
                              } else {
                                toast({
                                  title: 'Não suportado',
                                  description: 'Seu navegador não suporta geolocalização.',
                                  status: 'error',
                                  duration: 3000,
                                  isClosable: true,
                                });
                              }
                            }}
                            colorScheme="blue"
                          >
                            Usar localização
                          </Button>
                        </Flex>
                      </FormControl>
                      
                      <FormControl isRequired isInvalid={!!deliveryErrors.address}>
                        <FormLabel color={menuTextColor}>Endereço</FormLabel>
                        <Input 
                          id="address-input"
                          {...registerDelivery('address', { 
                            required: 'Endereço é obrigatório para entrega' 
                          })}
                          placeholder="Rua, número, bairro"
                        />
                        <FormErrorMessage>
                          {deliveryErrors.address?.message}
                        </FormErrorMessage>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel color={menuTextColor}>Complemento</FormLabel>
                        <Input 
                          {...registerDelivery('complement')}
                          placeholder="Apto, bloco, etc."
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel color={menuTextColor}>Ponto de referência</FormLabel>
                        <Input 
                          {...registerDelivery('reference')}
                          placeholder="Próximo a..."
                        />
                      </FormControl>
                    </>
                  )}
                </VStack>
              </form>
            )}
          </Box>
          
          <Flex 
            borderTop="1px solid" 
            borderColor="gray.100" 
            p={4} 
            justifyContent="flex-end"
            width="100%"
          >
            <Button 
              variant="outline" 
              mr={3} 
              onClick={() => {
                if (checkoutStep === 1) {
                  onCheckoutModalClose();
                } else {
                  setCheckoutStep(1);
                }
              }}
              color={menuTextColor}
              height="48px"
              px={6}
              fontSize="md"
              fontWeight="medium"
              borderRadius="md"
              borderColor="gray.300"
              _hover={{ bg: 'gray.100' }}
            >
              {checkoutStep === 1 ? 'Cancelar' : 'Voltar'}
            </Button>
            
            {checkoutStep === 1 ? (
              <Button 
                colorScheme="blue" 
                type="submit"
                form="customer-form"
                height="48px"
                px={8}
                fontSize="md"
                fontWeight="bold"
                borderRadius="md"
                boxShadow="sm"
                bgGradient="linear(to-r, blue.500, blue.600)"
                _hover={{ 
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  bgGradient: "linear(to-r, blue.600, blue.700)"
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'sm',
                  bgGradient: "linear(to-r, blue.700, blue.800)"
                }}
                transition="all 0.2s"
              >
                Continuar
              </Button>
            ) : (
              <Button 
                colorScheme="blue" 
                type="submit"
                form="delivery-form"
                height="48px"
                px={8}
                fontSize="md"
                fontWeight="bold"
                borderRadius="md"
                boxShadow="sm"
                bgGradient="linear(to-r, blue.500, blue.600)"
                _hover={{ 
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  bgGradient: "linear(to-r, blue.600, blue.700)"
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'sm',
                  bgGradient: "linear(to-r, blue.700, blue.800)"
                }}
                transition="all 0.2s"
              >
                Finalizar Pedido
              </Button>
            )}
          </Flex>
        </Box>
      </CustomCheckoutModal>

      {/* Botão do carrinho fixo */}
      <Box 
        position="fixed" 
        bottom={6} 
        right={6} 
        zIndex={10}
      >
        <Button
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          onClick={onCartDrawerOpen}
          boxShadow="0 4px 12px rgba(0,0,0,0.15)"
          leftIcon={<AddIcon />}
          sx={{
            px: 6,
            py: 3,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Sacola ({totalItems})
        </Button>
      </Box>
    </Box>
  );
};

// Componente de Modal personalizado
const CustomModal = ({ 
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '450px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

// Componente de Drawer personalizado para a sacola
const CustomDrawer = ({ 
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        zIndex: 99999, // Z-index extremamente alto para garantir que fique acima de tudo
      }}
      onClick={onClose}
    >
      <div 
        style={{
          height: '100%',
          maxWidth: '450px',
          width: '90%',
          position: 'relative',
          zIndex: 100000,
          animation: 'slideIn 0.3s ease-out forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}
        </style>
        {children}
      </div>
    </div>,
    document.body
  );
};

// Componente de Modal personalizado para checkout
const CustomCheckoutModal = ({ 
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999, // Z-index extremamente alto
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          zIndex: 1000000,
          width: '95%',
          maxWidth: '550px',
          animation: 'fadeInScale 0.2s ease-out forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes fadeInScale {
              from { opacity: 0.5; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}
        </style>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Menu;
