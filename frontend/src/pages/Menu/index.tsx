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
  Tooltip,
  FormHelperText,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { InfoIcon } from '@chakra-ui/icons';
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
import { useRestaurant } from '../../contexts/RestaurantContext';
import ProductOptionsSelector from '../../components/ProductOptionsSelector';
import { SelectedOption } from '../../types/product';
import { OptionGroup } from '../../types/product';

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
console.log('API_URL:', API_URL);

// Tipos para o formulário de cliente
interface CustomerFormData {
  name: string;
  phone: string;
  phoneFormatted?: string;
}

// Tipos para o formulário de entrega
interface DeliveryFormData {
  deliveryMethod?: 'pickup' | 'delivery' | 'dineIn';
  paymentMethod?: 'money' | 'pix' | 'credit' | 'debit';
  address?: string;
  complement?: string;
  reference?: string;
  changeFor?: number; // Para troco em caso de pagamento em dinheiro
  couponCode?: string; // Código do cupom
}

// Adicionar função para verificar se o restaurante está aberto
const isRestaurantOpen = (operatingHoursString?: string): boolean => {
  if (!operatingHoursString) return false;
  
  try {
    // Tentar converter a string JSON para objeto
    let operatingHours;
    try {
      operatingHours = JSON.parse(operatingHoursString);
    } catch (error) {
      console.log('Erro ao analisar horários:', error);
      return true; // Se não conseguir analisar, consideramos aberto por padrão
    }
    
    // Verificar o formato dos horários
    if (!operatingHours || typeof operatingHours !== 'object') {
      console.log('Formato de horários inválido');
      return true; // Por padrão, consideramos aberto
    }
    
    // Obter o dia da semana atual (0 = domingo, 1 = segunda, etc.)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    
    // Mapear o número do dia para a chave no objeto de horários
    const dayMap: Record<number, string> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    
    const dayKey = dayMap[dayOfWeek];
    const dayConfig = operatingHours[dayKey];
    
    // Se não houver configuração para o dia ou o isOpen for false, está fechado
    if (!dayConfig || dayConfig.isOpen === false) {
      console.log(`Restaurante fechado no ${dayKey}`);
      return false;
    }
    
    // Verificar se o horário atual está dentro do horário de funcionamento
    const openTime = dayConfig.open.split(':');
    const closeTime = dayConfig.close.split(':');
    
    const openHour = parseInt(openTime[0], 10);
    const openMinute = parseInt(openTime[1], 10);
    const closeHour = parseInt(closeTime[0], 10);
    const closeMinute = parseInt(closeTime[1], 10);
    
    // Converter horários para minutos para facilitar comparação
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    // Verificar se o horário atual está dentro do período de funcionamento
    const isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
    console.log(`Verificação de horário: ${dayKey}, atual: ${currentHour}:${currentMinute}, aberto: ${openHour}:${openMinute}, fechado: ${closeHour}:${closeMinute} => ${isOpen ? 'Aberto' : 'Fechado'}`);
    
    return isOpen;
  } catch (error) {
    console.error('Erro ao verificar horário de funcionamento:', error);
    return true; // Em caso de erro, consideramos aberto por padrão
  }
};

// Componente principal do cardápio digital
const Menu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [localRestaurantId, setLocalRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [isOpen, setIsOpen] = useState(true);
  
  const { 
    items, 
    addItem, 
    removeItem, 
    updateItemQuantity, 
    updateItemNotes, 
    clearCart, 
    totalItems, 
    totalPrice,
    restaurantId: cartRestaurantId,
    setRestaurantId,
    coupon,
    couponCode,
    setCouponCode,
    applyCoupon,
    removeCoupon,
    discount,
    finalPrice
  } = useCart();
  
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isRestaurantOpen, themeColor, setThemeColor } = useRestaurant();
  
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
    watch: watchDelivery,
    setValue: setDeliveryValue
  } = useForm<DeliveryFormData>({
    defaultValues: {
      deliveryMethod: undefined,
      paymentMethod: undefined
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
  
  // Adicionar estado para as opções selecionadas
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  
  // Função para navegar para a página de cupons
  const handleNavigateToCoupons = () => {
    if (cartRestaurantId) {
      navigate(`/restaurants/${cartRestaurantId}/coupons`);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível acessar os cupons",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Buscar dados do restaurante e produtos
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        
        // Buscar informações do restaurante pelo slug
        const restaurant = await restaurantService.getBySlug(slug);
        setLocalRestaurantId(restaurant.id);
        setRestaurantId(restaurant.id); // Atualizar o ID no contexto do carrinho
        
        // Verificar se o restaurante possui uma cor personalizada
        if (restaurant.themeColor) {
          setThemeColor(restaurant.themeColor);
          console.log('Cor do tema do restaurante:', restaurant.themeColor);
        }
        
        // Verificar se o restaurante está aberto com base nos horários
        let restaurantIsOpen = true; // Valor padrão
        
        if (restaurant.operatingHours) {
          try {
            // Tentar converter para objeto se for string
            const operatingHours = typeof restaurant.operatingHours === 'string' 
              ? JSON.parse(restaurant.operatingHours) 
              : restaurant.operatingHours;
            
            if (operatingHours && typeof operatingHours === 'object') {
              // Obter dia da semana atual (0 = domingo, 1 = segunda, etc.)
              const currentDate = new Date();
              const dayOfWeek = currentDate.getDay();
              const currentHour = currentDate.getHours();
              const currentMinute = currentDate.getMinutes();
              
              // Mapear o número do dia para a chave no objeto de horários
              const dayMap: Record<number, string> = {
                0: 'sunday',
                1: 'monday',
                2: 'tuesday',
                3: 'wednesday',
                4: 'thursday',
                5: 'friday',
                6: 'saturday'
              };
              
              const dayKey = dayMap[dayOfWeek];
              const dayConfig = operatingHours[dayKey];
              
              // Se não houver configuração para o dia ou o isOpen for false, está fechado
              if (!dayConfig || dayConfig.isOpen === false) {
                restaurantIsOpen = false;
              } else {
                // Verificar se o horário atual está dentro do horário de funcionamento
                const openTime = dayConfig.open.split(':');
                const closeTime = dayConfig.close.split(':');
                
                const openHour = parseInt(openTime[0], 10);
                const openMinute = parseInt(openTime[1], 10);
                const closeHour = parseInt(closeTime[0], 10);
                const closeMinute = parseInt(closeTime[1], 10);
                
                // Converter horários para minutos para facilitar comparação
                const currentTimeInMinutes = currentHour * 60 + currentMinute;
                const openTimeInMinutes = openHour * 60 + openMinute;
                const closeTimeInMinutes = closeHour * 60 + closeMinute;
                
                // Verificar se o horário atual está dentro do período de funcionamento
                restaurantIsOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
              }
            }
          } catch (error) {
            console.error('Erro ao verificar horário de funcionamento:', error);
            // Em caso de erro, consideramos aberto por padrão
            restaurantIsOpen = true;
          }
        }
        
        setIsOpen(restaurantIsOpen);
        console.log('Restaurante está aberto:', restaurantIsOpen);
        
        // Mapear operatingHours para openingHours para compatibilidade com o MenuHeader
        const restaurantInfo = {
          ...restaurant,
          openingHours: typeof restaurant.operatingHours === 'object' 
            ? JSON.stringify(restaurant.operatingHours) 
            : restaurant.operatingHours || '',
          // As URLs já estão completas graças às modificações no restaurantService
          logo: restaurant.logo,
          coverImage: restaurant.coverImage,
          // Adicionar themeColor ao restaurantInfo
          themeColor: restaurant.themeColor || themeColor
        };
        
        console.log('RestaurantInfo com URLs completas:', restaurantInfo);
        
        setRestaurantInfo(restaurantInfo);
        setLocalRestaurantId(restaurant.id);
        
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
            let updatedProduct = { ...product };
            
            // Atribuir categoria padrão se necessário
            if (!updatedProduct.categoryId && defaultCategoryId) {
              console.log(`Atribuindo categoria temporária (${defaultCategoryId}) para produto: ${updatedProduct.name}`);
              updatedProduct.categoryId = defaultCategoryId;
            }
            
            return updatedProduct;
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
  }, [slug, setLocalRestaurantId, setRestaurantId, toast, themeColor]);
  
  // Adicione este console.log para depuração
  useEffect(() => {
    if (products.length > 0) {
      console.log('Produtos carregados:', products);
    }
  }, [products]);
  
  // Adicionar este useEffect para logar o restaurantInfo quando ele mudar
  useEffect(() => {
    if (restaurantInfo) {
      console.log('restaurantInfo completo:', restaurantInfo);
      console.log('Logo URL:', restaurantInfo.logo);
      console.log('Cover Image URL:', restaurantInfo.coverImage);
    }
  }, [restaurantInfo]);
  
  // Adicionar este useEffect após os outros useEffect existentes
  useEffect(() => {
    if (selectedProduct && selectedProduct.additionalOptions) {
      console.log('UseEffect - additionalOptions no selectedProduct:', selectedProduct.additionalOptions);
      
      // Se additionalOptions for uma string, tentar fazer o parse para objeto
      if (typeof selectedProduct.additionalOptions === 'string' && (selectedProduct.additionalOptions as string).trim() !== '') {
        try {
          const parsedOptions = JSON.parse(selectedProduct.additionalOptions as string);
          console.log('UseEffect - additionalOptions parseado:', parsedOptions);
          setSelectedProduct({
            ...selectedProduct,
            additionalOptions: parsedOptions
          });
        } catch (error) {
          console.error('UseEffect - Erro ao parsear additionalOptions:', error);
        }
      }
    }
  }, [selectedProduct?.id]);
  
  // Adicionar este useEffect para logar os complementos processados
  useEffect(() => {
    if (selectedProduct) {
      console.log('Produto selecionado:', selectedProduct.name);
      console.log('additionalOptions (tipo):', typeof selectedProduct.additionalOptions);
      console.log('additionalOptions (valor):', selectedProduct.additionalOptions);
      const processedOptions = getProcessedOptionGroups(selectedProduct.additionalOptions);
      console.log('additionalOptions processado:', processedOptions);
      console.log('Número de grupos de opções:', processedOptions.length);
      if (processedOptions.length > 0) {
        console.log('Primeiro grupo:', processedOptions[0]);
      }
    }
  }, [selectedProduct]);
  
  // Abrir modal de produto - atualizar para limpar as opções selecionadas
  const handleOpenProductModal = (product: Product) => {
    console.log('Abrindo modal para produto:', product);
    console.log('additionalOptions original:', product.additionalOptions);
    console.log('Tipo do additionalOptions:', typeof product.additionalOptions);
    
    // Processar additionalOptions se necessário
    let processedProduct = { ...product };
    
    if (product.additionalOptions) {
      try {
        // Se for string, tentar fazer parse para interpretar corretamente
        if (typeof product.additionalOptions === 'string' && (product.additionalOptions as string).trim() !== '') {
          console.log('Tentando fazer parse de string:', product.additionalOptions);
          const parsed = JSON.parse(product.additionalOptions as string);
          console.log('Resultado do parse:', parsed);
          processedProduct.additionalOptions = Array.isArray(parsed) ? parsed : [parsed];
        } 
        // Se já for um array, usar diretamente
        else if (Array.isArray(product.additionalOptions)) {
          console.log('additionalOptions já é um array:', product.additionalOptions);
          processedProduct.additionalOptions = product.additionalOptions;
        }
        // Se for um objeto único, converter para array
        else if (product.additionalOptions && typeof product.additionalOptions === 'object') {
          console.log('additionalOptions é um objeto único:', product.additionalOptions);
          processedProduct.additionalOptions = [product.additionalOptions];
        }
        
        // Validar a estrutura dos grupos
        if (Array.isArray(processedProduct.additionalOptions)) {
          processedProduct.additionalOptions = processedProduct.additionalOptions.filter(group => {
            const isValid = group && 
              typeof group === 'object' && 
              'name' in group && 
              'options' in group && 
              Array.isArray(group.options);
            
            if (!isValid) {
              console.warn('Grupo inválido encontrado:', group);
            }
            
            return isValid;
          });
        }
        
        console.log('additionalOptions processado final:', processedProduct.additionalOptions);
      } catch (error) {
        console.error('Erro ao processar additionalOptions:', error);
        processedProduct.additionalOptions = [];
      }
    } else {
      console.log('Produto não possui additionalOptions');
      processedProduct.additionalOptions = [];
    }
    
    // Limpar seleções anteriores
    setSelectedProduct(processedProduct);
    setQuantity(1);
    setNotes('');
    setSelectedOptions([]);
    onProductModalOpen();
  };
  
  // Adicionar produto ao carrinho - atualizar para incluir as opções selecionadas
  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast({
        title: 'Erro',
        description: 'Produto não selecionado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Verificar se o restaurante está aberto
    if (!isOpen) {
      toast({
        title: 'Restaurante fechado',
        description: 'O restaurante está fechado no momento. Não é possível realizar pedidos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Verificar se additionalOptions é um array válido
    const hasValidAdditionalOptions = selectedProduct.additionalOptions && 
                                      Array.isArray(selectedProduct.additionalOptions) && 
                                      selectedProduct.additionalOptions.length > 0;
    
    // Log para depuração
    console.log('Product additionalOptions:', selectedProduct.additionalOptions);
    console.log('Selected options:', selectedOptions);
    
    // Verificar se há grupos de opções obrigatórios sem seleção
    if (hasValidAdditionalOptions) {
      // Usando type assertion para garantir que o TypeScript saiba que additionalOptions é um array
      const additionalOptions = selectedProduct.additionalOptions as OptionGroup[];
      const requiredGroups = additionalOptions.filter(group => group.required);
      
      const missingRequiredGroups = requiredGroups.filter(group => {
        // Verificar se existe alguma opção selecionada para este grupo
        return !selectedOptions.some(selected => selected.groupName === group.name);
      });
      
      if (missingRequiredGroups.length > 0) {
        toast({
          title: 'Complementos obrigatórios',
          description: `Por favor, selecione as opções obrigatórias: ${missingRequiredGroups.map(g => g.name).join(', ')}`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }
    
    // Adicionar o item ao carrinho
    addItem({
      product: selectedProduct,
      quantity: quantity,
      notes: notes,
      selectedOptions: selectedOptions,
    });
    
    // Calcular preço total incluindo os complementos
    let totalWithOptions = selectedProduct.price;
    selectedOptions.forEach(option => {
      totalWithOptions += option.option.price;
    });
    
    const formattedTotalPrice = new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(totalWithOptions * quantity);
    
    toast({
      title: 'Produto adicionado',
      description: `${selectedProduct.name} foi adicionado à sacola por ${formattedTotalPrice}.`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    
    // Fechar o modal e resetar os estados
    onProductModalClose();
    setSelectedProduct(null);
    setQuantity(1);
    setNotes('');
    setSelectedOptions([]);
  };
  
  // Iniciar processo de checkout
  const handleStartCheckout = () => {
    // Verificar se o restaurante está aberto antes de iniciar o checkout
    if (!isRestaurantOpen) {
      toast({
        title: 'Restaurante fechado',
        description: 'O restaurante está fechado no momento. Não é possível realizar pedidos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setCheckoutStep(1);
    onCheckoutModalOpen();
    setTimeout(() => {
      onCartDrawerClose();
    }, 300);
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
            if (!cartRestaurantId) {
              console.error('ID do restaurante não disponível, não é possível salvar o cliente');
              return;
            }
            
            console.log('Usando restaurante ID:', cartRestaurantId, 'para salvar o cliente:', customerData);
            
            // Formatar o número de telefone (remover caracteres não numéricos)
            const formattedPhone = customerData.phone.replace(/\D/g, '');
            const phoneWithPrefix = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;
            
            // Criar cliente diretamente com os dados corretos
            const customerToCreate = {
              name: customerData.name || 'Cliente',
              email: `${phoneWithPrefix.substring(0, 6)}@cliente.temp`,
              phone: phoneWithPrefix,
              restaurantId: cartRestaurantId
            };
            
            console.log('Dados do cliente para criação:', customerToCreate);
            
            // Usar a API diretamente para evitar problemas de validação
            const customerResponse = await api.post(`/restaurants/${cartRestaurantId}/customers`, {
              name: customerToCreate.name,
              email: customerToCreate.email,
              phone: customerToCreate.phone
            });
            
            console.log('Cliente salvo no banco de dados com sucesso:', customerResponse.data);
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
      // Verificar se o restaurante está aberto antes de processar o pedido
      if (!isRestaurantOpen) {
        toast({
          title: 'Restaurante fechado',
          description: 'O restaurante está fechado no momento. Não é possível finalizar o pedido.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Verificar se o método de entrega e o método de pagamento foram selecionados
      if (!deliveryData.deliveryMethod) {
      toast({
          title: 'Erro',
          description: 'Por favor, selecione um método de entrega',
        status: 'error',
          duration: 3000,
        isClosable: true,
        });
        return;
      }

      if (!deliveryData.paymentMethod) {
      toast({
          title: 'Forma de pagamento não selecionada',
          description: 'Por favor, selecione uma forma de pagamento para continuar.',
        status: 'error',
          duration: 3000,
        isClosable: true,
        });
        return;
      }

      // Verificar se o endereço foi preenchido quando o método de entrega é delivery
      if (deliveryData.deliveryMethod === 'delivery' && !deliveryData.address) {
        toast({
          title: 'Endereço não informado',
          description: 'Por favor, informe o endereço de entrega para continuar.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Usar dados do cliente salvos no estado em vez de acessar o formulário
      if (customerFormData) {
        // Salvar dados do cliente
        saveCustomerInfo({
          name: customerFormData.name, 
          phone: customerFormData.phone
        });
      
      // Preparar itens do pedido
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes,
        // Incluir os complementos selecionados
        additionalOptions: item.selectedOptions ? item.selectedOptions.reduce((acc, option) => {
          // Criar um objeto com os complementos selecionados
          acc[option.groupName] = {
            name: option.option.name,
            price: option.option.price
          };
          return acc;
        }, {} as Record<string, any>) : {}
      }));
      
      // Criar objeto de pedido
      const orderData: CustomerOrderData = {
        customerName: customerFormData.name,
        customerPhone: customerFormData.phoneFormatted || customerFormData.phone.replace(/\D/g, ''),
        items: orderItems,
        deliveryMethod: deliveryData.deliveryMethod as 'pickup' | 'delivery' | 'dineIn',
        paymentMethod: deliveryData.paymentMethod as 'money' | 'pix' | 'credit' | 'debit',
        changeFor: deliveryData.changeFor,
        deliveryAddress: deliveryData.deliveryMethod === 'delivery' 
          ? `${deliveryData.address}, ${deliveryData.complement || ''} - Ref: ${deliveryData.reference || ''}` 
          : undefined,
        couponCode: coupon ? coupon.code : undefined
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
      if (!cartRestaurantId) {
        throw new Error('ID do restaurante não encontrado');
      }
      
      // Garantir que cartRestaurantId é uma string
      const restaurantId: string = cartRestaurantId;
      const orderResponse = await menuService.createOrder(restaurantId, orderData);
      const orderId = orderResponse.id;
      
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
                // Verificar se o restaurante está aberto
                if (!isOpen) {
                  toast({
                    title: 'Restaurante fechado',
                    description: 'O restaurante está fechado no momento. Não é possível realizar pedidos.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                  });
                  return;
                }
                
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
              isRestaurantOpen={isOpen}
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
  
  // Log restaurantInfo antes de renderizar
  if (restaurantInfo) {
    console.log('restaurantInfo:', restaurantInfo);
  }
  
  return (
    <Box bg={menuBgColor} minH="100vh" display="flex" flexDirection="column" alignItems="center" position="relative">
      {/* Estilo global para garantir que o menu não seja afetado pelo tema do dashboard */}
      <style>
        {`
          body, html {
            background-color: white !important;
            color: #333333 !important;
          }
          
          #root {
            background-color: white !important;
            color: #333333 !important;
          }
          
          /* Garantir que componentes Material UI respeitem essas cores */
          .MuiPaper-root, .MuiBox-root, .MuiContainer-root {
            color: inherit !important;
          }
          
          /* Personalização da cor do tema */
          :root {
            --theme-color: ${themeColor};
            --theme-color-light: ${themeColor}33;
            --theme-color-medium: ${themeColor}66;
          }
        `}
      </style>
      
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
                  color: themeColor,
                  fontWeight: 'medium',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: `1px solid ${themeColor}30`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: `${themeColor}10`,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    borderColor: `${themeColor}80`,
                  },
                  '&:active': {
                    backgroundColor: `${themeColor}20`,
                    transform: 'translateY(0)',
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
                    backgroundColor: themeColor,
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
            
            <Text fontWeight="bold" fontSize="xl" mb={4} color={themeColor}>
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
            
            {/* Exibir o ProductOptionsSelector e adicionar logs para depuração */}
            {selectedProduct && (
              <Box mt={4}>
                {(() => {
                  // Obter os complementos processados
                  let processedOptions = [];
                  
                  try {
                    // Se additionalOptions for uma string, tentar fazer parse
                    if (typeof selectedProduct.additionalOptions === 'string') {
                      const parsed = JSON.parse(selectedProduct.additionalOptions);
                      processedOptions = Array.isArray(parsed) ? parsed : [parsed];
                    } 
                    // Se já for um array, usar diretamente
                    else if (Array.isArray(selectedProduct.additionalOptions)) {
                      processedOptions = selectedProduct.additionalOptions;
                    }
                    // Se for um objeto único, converter para array
                    else if (selectedProduct.additionalOptions && typeof selectedProduct.additionalOptions === 'object') {
                      processedOptions = [selectedProduct.additionalOptions];
                    }
                    
                    // Validar a estrutura dos grupos
                    processedOptions = processedOptions.filter(group => 
                      group && 
                      typeof group === 'object' && 
                      'name' in group && 
                      'options' in group && 
                      Array.isArray(group.options)
                    );
                    
                    console.log('Complementos processados para exibição:', processedOptions);
                  } catch (error) {
                    console.error('Erro ao processar complementos:', error);
                    processedOptions = [];
                  }
                  
                  // Verificar se temos complementos válidos
                  if (processedOptions.length > 0) {
                    return (
                      <ProductOptionsSelector 
                        optionGroups={processedOptions} 
                        onOptionsChange={setSelectedOptions}
                      />
                    );
                  } else {
                    return (
                      <Box p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200" mt={2}>
                        <Text color="gray.500" fontSize="sm" mb={2}>
                          Este produto não possui complementos disponíveis.
                        </Text>
                      </Box>
                    );
                  }
                })()}
              </Box>
            )}
            
            <FormControl mt={4}>
              <FormLabel fontWeight="medium">Observações (opcional)</FormLabel>
              <Textarea 
                placeholder="Ex: Sem cebola, sem tomate, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxH="100px"
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
              bgGradient={`linear(to-r, ${themeColor}, ${themeColor}cc)`}
              color="white"
              height="48px"
              _hover={{ 
                transform: 'translateY(-2px)',
                boxShadow: 'md',
                bgGradient: `linear(to-r, ${themeColor}cc, ${themeColor})`
              }}
              _active={{
                transform: 'translateY(0)',
                boxShadow: 'sm',
                bgGradient: `linear(to-r, ${themeColor}dd, ${themeColor}ee)`
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
            p={4}
            borderTop="1px solid" 
            borderColor="gray.200" 
            position="absolute"
            bottom="0"
            left="0"
            width="100%"
          >
            <VStack width="100%" spacing={4}>
              <Flex justify="space-between" width="100%">
                <Text fontWeight="bold" color={menuTextColor} fontSize="lg">Total:</Text>
                <Text fontWeight="bold" color={themeColor} fontSize="lg">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(totalPrice)}
                </Text>
              </Flex>
              
              <Button 
                colorScheme="blue" 
                width="100%" 
                isDisabled={items.length === 0 || !isOpen}
                onClick={() => {
                  if (!isOpen) {
                    toast({
                      title: 'Restaurante fechado',
                      description: 'O restaurante está fechado no momento. Não é possível realizar pedidos.',
                      status: 'error',
                      duration: 5000,
                      isClosable: true,
                    });
                    return;
                  }
                  handleStartCheckout();
                }}
                height="48px"
                fontWeight="bold"
                boxShadow="sm"
                bgGradient={`linear(to-r, ${themeColor}, ${themeColor}cc)`}
                _hover={{ 
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  bgGradient: `linear(to-r, ${themeColor}cc, ${themeColor})`
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'sm',
                  bgGradient: `linear(to-r, ${themeColor}dd, ${themeColor}ee)`
                }}
                transition="all 0.2s"
              >
                Finalizar Pedido
              </Button>
              
              {!isOpen && items.length > 0 && (
                <Tooltip label="Restaurante fechado" hasArrow placement="top">
                  <Box 
                    as="span" 
                    width="1rem" 
                    height="1rem" 
                    display="inline-block" 
                    position="absolute" 
                    right="10px" 
                    top="15px"
                    borderRadius="50%"
                    backgroundColor="red.500"
                    zIndex={5}
                    cursor="pointer"
                  ></Box>
                </Tooltip>
              )}
            </VStack>
          </Box>
        </Box>
      </CustomDrawer>
      
      {/* Modal de checkout */}
      <CustomCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={onCheckoutModalClose}
        title={checkoutStep === 1 ? "Dados do Cliente" : "Finalizar Pedido"}
      >
            {checkoutStep === 1 ? (
          <form onSubmit={handleSubmitCustomer(onCustomerFormSubmit)}>
                <VStack spacing={4}>
              <FormControl isInvalid={!!customerErrors.name}>
                <FormLabel>Nome</FormLabel>
                    <Input 
                      {...registerCustomer('name', { required: 'Nome é obrigatório' })}
                      placeholder="Seu nome completo"
                    />
                    <FormErrorMessage>
                      {customerErrors.name?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
              <FormControl isInvalid={!!customerErrors.phone}>
                <FormLabel>Telefone</FormLabel>
                    <Input 
                      {...registerCustomer('phone', { 
                        required: 'Telefone é obrigatório',
                        pattern: {
                      value: /^\d{10,11}$/,
                      message: 'Telefone inválido'
                    }
                  })}
                  placeholder="(00) 00000-0000"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    e.target.value = value;
                    if (value.length >= 10) {
                      checkExistingCustomer(value);
                        }
                      }}
                    />
                    <FormErrorMessage>
                      {customerErrors.phone?.message}
                    </FormErrorMessage>
                  </FormControl>
                  
              <Button
                colorScheme="blue"
                width="100%"
                type="submit"
                height="48px"
                fontWeight="bold"
                bgGradient={`linear(to-r, ${themeColor}, ${themeColor}cc)`}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  bgGradient: `linear(to-r, ${themeColor}cc, ${themeColor})`
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'sm',
                  bgGradient: `linear(to-r, ${themeColor}dd, ${themeColor}ee)`
                }}
                transition="all 0.2s"
              >
                Continuar
              </Button>
                </VStack>
              </form>
            ) : (
          <form onSubmit={handleSubmitDelivery(handleDeliveryFormSubmitWithSave)}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="bold">Método de Entrega</FormLabel>
                <Flex
                  flexDirection="row"
                  width="100%"
                  mb={4}
                  justifyContent="space-between"
                >
                  {/* Opção Retirar no Local */}
                  <Box 
                    onClick={() => {
                      if (watchDelivery('deliveryMethod') === 'pickup') {
                        setDeliveryValue('deliveryMethod', undefined);
                      } else {
                        setDeliveryValue('deliveryMethod', 'pickup');
                      }
                    }}
                    cursor="pointer"
                    borderWidth="2px"
                    borderRadius="md"
                    borderColor={watchDelivery('deliveryMethod') === 'pickup' ? themeColor : 'gray.200'}
                    bg={watchDelivery('deliveryMethod') === 'pickup' ? `${themeColor}10` : 'white'}
                    p={3}
                    transition="all 0.2s"
                    width="calc(33.33% - 8px)"
                    position="relative"
                    _hover={{
                      borderColor: themeColor,
                      bg: `${themeColor}05`
                    }}
                  >
                    <Flex align="center" justify="center" width="100%">
                      <Box 
                        borderRadius="full" 
                        borderWidth="2px" 
                        borderColor={watchDelivery('deliveryMethod') === 'pickup' ? themeColor : 'gray.300'}
                        w="20px" 
                        h="20px" 
                        mr={2}
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        {watchDelivery('deliveryMethod') === 'pickup' && (
                          <Box 
                            w="10px" 
                            h="10px" 
                            borderRadius="full" 
                            bg={themeColor} 
                          />
                        )}
                          </Box>
                      <Text fontWeight="medium" fontSize="sm">🏬 Retirar no Local</Text>
                    </Flex>
                  </Box>

                  {/* Opção Entrega */}
                  <Box 
                    onClick={() => {
                      if (watchDelivery('deliveryMethod') === 'delivery') {
                        setDeliveryValue('deliveryMethod', undefined);
                                } else {
                        setDeliveryValue('deliveryMethod', 'delivery');
                      }
                    }}
                    cursor="pointer"
                    borderWidth="2px"
                    borderRadius="md"
                    borderColor={watchDelivery('deliveryMethod') === 'delivery' ? themeColor : 'gray.200'}
                    bg={watchDelivery('deliveryMethod') === 'delivery' ? `${themeColor}10` : 'white'}
                    p={3}
                    transition="all 0.2s"
                    width="calc(33.33% - 8px)"
                    position="relative"
                    _hover={{
                      borderColor: themeColor,
                      bg: `${themeColor}05`
                    }}
                  >
                    <Flex align="center" justify="center" width="100%">
                      <Box 
                        borderRadius="full" 
                        borderWidth="2px" 
                        borderColor={watchDelivery('deliveryMethod') === 'delivery' ? themeColor : 'gray.300'}
                        w="20px" 
                        h="20px" 
                            mr={2}
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        {watchDelivery('deliveryMethod') === 'delivery' && (
                          <Box 
                            w="10px" 
                            h="10px" 
                            borderRadius="full" 
                            bg={themeColor} 
                          />
                        )}
                      </Box>
                      <Text fontWeight="medium" fontSize="sm">🚚 Entrega</Text>
                    </Flex>
                  </Box>

                  {/* Opção Consumir no Local */}
                  <Box 
                    onClick={() => {
                      if (watchDelivery('deliveryMethod') === 'dineIn') {
                        setDeliveryValue('deliveryMethod', undefined);
                              } else {
                        setDeliveryValue('deliveryMethod', 'dineIn');
                      }
                    }}
                    cursor="pointer"
                    borderWidth="2px"
                    borderRadius="md"
                    borderColor={watchDelivery('deliveryMethod') === 'dineIn' ? themeColor : 'gray.200'}
                    bg={watchDelivery('deliveryMethod') === 'dineIn' ? `${themeColor}10` : 'white'}
                    p={3}
                    transition="all 0.2s"
                    width="calc(33.33% - 8px)"
                    position="relative"
                    _hover={{
                      borderColor: themeColor,
                      bg: `${themeColor}05`
                    }}
                  >
                    <Flex align="center" justify="center" width="100%">
                      <Box 
                        borderRadius="full" 
                        borderWidth="2px" 
                        borderColor={watchDelivery('deliveryMethod') === 'dineIn' ? themeColor : 'gray.300'}
                        w="20px" 
                        h="20px" 
                        mr={2}
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        {watchDelivery('deliveryMethod') === 'dineIn' && (
                          <Box 
                            w="10px" 
                            h="10px" 
                            borderRadius="full" 
                            bg={themeColor} 
                          />
                        )}
                      </Box>
                      <Text fontWeight="medium" fontSize="sm">🍽️ Consumir no Local</Text>
                        </Flex>
                  </Box>
                </Flex>
                {!watchDelivery('deliveryMethod') && (
                  <FormHelperText color="red.500">
                    Selecione um método de entrega
                  </FormHelperText>
                )}
                      </FormControl>
                      
              {watchDelivery('deliveryMethod') === 'delivery' && (
                <Box 
                  p={4} 
                  borderWidth="1px" 
                  borderColor="gray.200" 
                  borderRadius="md" 
                  bg="gray.50"
                  mt={3}
                  width="100%"
                  maxHeight="300px"
                  overflowY="auto"
                  sx={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${themeColor} transparent`,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: themeColor,
                      borderRadius: '4px',
                    },
                  }}
                >
                  <FormControl isInvalid={!!deliveryErrors.address} mb={4}>
                    <FormLabel>Endereço</FormLabel>
                        <Input 
                          {...registerDelivery('address', { 
                            required: 'Endereço é obrigatório para entrega' 
                          })}
                          placeholder="Rua, número, bairro"
                      bg="white"
                        />
                        <FormErrorMessage>
                          {deliveryErrors.address?.message}
                        </FormErrorMessage>
                      </FormControl>
                      
                  <FormControl mb={4}>
                    <FormLabel>Complemento</FormLabel>
                        <Input 
                          {...registerDelivery('complement')}
                      placeholder="Apartamento, bloco, etc."
                      bg="white"
                        />
                      </FormControl>
                      
                      <FormControl>
                    <FormLabel>Ponto de Referência</FormLabel>
                        <Input 
                          {...registerDelivery('reference')}
                          placeholder="Próximo a..."
                      bg="white"
                        />
                      </FormControl>
                </Box>
              )}

              <FormControl mt={4}>
                <FormLabel fontWeight="bold">Forma de Pagamento</FormLabel>
                <Flex 
                  flexWrap="wrap" 
                  gap={3} 
                  justifyContent="space-between"
                  position="relative"
                >
                  {/* Opção PIX */}
                  <Box 
                    onClick={() => {
                      if (watchDelivery('paymentMethod') === 'pix') {
                        setDeliveryValue('paymentMethod', undefined);
                      } else {
                        setDeliveryValue('paymentMethod', 'pix');
                      }
                    }}
                    cursor="pointer"
                    borderWidth="2px"
                    borderRadius="md"
                    borderColor={watchDelivery('paymentMethod') === 'pix' ? themeColor : 'gray.200'}
                    bg={watchDelivery('paymentMethod') === 'pix' ? `${themeColor}10` : 'white'}
                    p={3}
                    transition="all 0.2s"
                    width={{ base: "100%", sm: "48%" }}
                    position="relative"
                    _hover={{
                      borderColor: themeColor,
                      bg: `${themeColor}05`
                    }}
                  >
                    <Flex align="center" justify="center" width="100%">
                      <Box 
                        borderRadius="full" 
                        borderWidth="2px" 
                        borderColor={watchDelivery('paymentMethod') === 'pix' ? themeColor : 'gray.300'}
                        w="20px" 
                        h="20px" 
                        mr={2}
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        {watchDelivery('paymentMethod') === 'pix' && (
                          <Box 
                            w="10px" 
                            h="10px" 
                            borderRadius="full" 
                            bg={themeColor} 
                          />
                        )}
                      </Box>
                      <Text fontWeight="medium" fontSize="sm">💸 PIX</Text>
                    </Flex>
          </Box>
          
                  {/* Opção Cartão de Crédito */}
                  <Box 
                    onClick={() => {
                      if (watchDelivery('paymentMethod') === 'credit') {
                        setDeliveryValue('paymentMethod', undefined);
                      } else {
                        setDeliveryValue('paymentMethod', 'credit');
                      }
                    }}
                    cursor="pointer"
                    borderWidth="2px"
                    borderRadius="md"
                    borderColor={watchDelivery('paymentMethod') === 'credit' ? themeColor : 'gray.200'}
                    bg={watchDelivery('paymentMethod') === 'credit' ? `${themeColor}10` : 'white'}
                    p={3}
                    transition="all 0.2s"
                    width={{ base: "100%", sm: "48%" }}
                    position="relative"
                    _hover={{
                      borderColor: themeColor,
                      bg: `${themeColor}05`
                    }}
                  >
                    <Flex align="center" justify="center" width="100%">
                      <Box 
                        borderRadius="full" 
                        borderWidth="2px" 
                        borderColor={watchDelivery('paymentMethod') === 'credit' ? themeColor : 'gray.300'}
                        w="20px" 
                        h="20px" 
                        mr={2}
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        {watchDelivery('paymentMethod') === 'credit' && (
                          <Box 
                            w="10px" 
                            h="10px" 
                            borderRadius="full" 
                            bg={themeColor} 
                          />
                        )}
                      </Box>
                      <Text fontWeight="medium" fontSize="sm">💳 Cartão de Crédito</Text>
                    </Flex>
                  </Box>

                  {/* Opção Cartão de Débito */}
                  <Box 
              onClick={() => {
                      if (watchDelivery('paymentMethod') === 'debit') {
                        setDeliveryValue('paymentMethod', undefined);
                } else {
                        setDeliveryValue('paymentMethod', 'debit');
                      }
                    }}
                    cursor="pointer"
                    borderWidth="2px"
              borderRadius="md"
                    borderColor={watchDelivery('paymentMethod') === 'debit' ? themeColor : 'gray.200'}
                    bg={watchDelivery('paymentMethod') === 'debit' ? `${themeColor}10` : 'white'}
                    p={3}
                    transition="all 0.2s"
                    width={{ base: "100%", sm: "48%" }}
                    position="relative"
                    _hover={{
                      borderColor: themeColor,
                      bg: `${themeColor}05`
                    }}
                  >
                    <Flex align="center" justify="center" width="100%">
                      <Box 
                        borderRadius="full" 
                        borderWidth="2px" 
                        borderColor={watchDelivery('paymentMethod') === 'debit' ? themeColor : 'gray.300'}
                        w="20px" 
                        h="20px" 
                        mr={2}
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        {watchDelivery('paymentMethod') === 'debit' && (
                          <Box 
                            w="10px" 
                            h="10px" 
                            borderRadius="full" 
                            bg={themeColor} 
                          />
                        )}
                      </Box>
                      <Text fontWeight="medium" fontSize="sm">💳 Cartão de Débito</Text>
                    </Flex>
                  </Box>

                  {/* Opção Dinheiro */}
                  <Box 
                    onClick={() => {
                      if (watchDelivery('paymentMethod') === 'money') {
                        setDeliveryValue('paymentMethod', undefined);
                      } else {
                        setDeliveryValue('paymentMethod', 'money');
                      }
                    }}
                    cursor="pointer"
                    borderWidth="2px"
                    borderRadius="md"
                    borderColor={watchDelivery('paymentMethod') === 'money' ? themeColor : 'gray.200'}
                    bg={watchDelivery('paymentMethod') === 'money' ? `${themeColor}10` : 'white'}
                    p={3}
                    transition="all 0.2s"
                    width={{ base: "100%", sm: "48%" }}
                    position="relative"
                    _hover={{
                      borderColor: themeColor,
                      bg: `${themeColor}05`
                    }}
                  >
                    <Flex align="center" justify="center" width="100%">
                      <Box 
                        borderRadius="full" 
                        borderWidth="2px" 
                        borderColor={watchDelivery('paymentMethod') === 'money' ? themeColor : 'gray.300'}
                        w="20px" 
                        h="20px" 
                        mr={2}
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        {watchDelivery('paymentMethod') === 'money' && (
                          <Box 
                            w="10px" 
                            h="10px" 
                            borderRadius="full" 
                            bg={themeColor} 
                          />
                        )}
                      </Box>
                      <Text fontWeight="medium" fontSize="sm">💵 Dinheiro</Text>
                    </Flex>
                  </Box>
                </Flex>
                {!watchDelivery('paymentMethod') && (
                  <FormHelperText color="red.500">
                    Selecione uma forma de pagamento
                  </FormHelperText>
                )}
              </FormControl>

              {watchDelivery('paymentMethod') === 'money' && (
                <Box 
                  p={4} 
                  borderWidth="1px" 
                  borderColor="gray.200" 
                  borderRadius="md" 
                  bg="gray.50"
                  mt={3}
                  width="100%"
                  sx={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${themeColor} transparent`,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: themeColor,
                      borderRadius: '4px',
                    },
                  }}
                >
                  <FormControl>
                    <FormLabel>Troco para quanto?</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField 
                        {...registerDelivery('changeFor')}
                        placeholder="0,00"
                        bg="white"
                      />
                    </NumberInput>
                    <FormHelperText>Deixe em branco se não precisar de troco</FormHelperText>
                  </FormControl>
                </Box>
              )}

              {/* Adicionar campo de cupom */}
              <Box 
                width="100%" 
                p={4} 
                bg="gray.50" 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="gray.200"
                mt={4}
              >
                <FormControl>
                  <FormLabel fontWeight="bold" mb={3}>Cupom de Desconto</FormLabel>
                  <Flex>
                    <Input
                      placeholder="Digite o código do cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      mr={2}
                      bg="white"
                      size="lg"
                      borderRadius="md"
                      borderColor="gray.300"
                      _hover={{ 
                        borderColor: themeColor
                      }}
                      _focus={{
                        borderColor: themeColor,
                        boxShadow: `0 0 0 1px ${themeColor}`
                      }}
                    />
              <Button 
                      onClick={() => applyCoupon()}
                colorScheme="blue" 
                      size="lg"
                px={8}
                      height="48px"
                      bgGradient={`linear(to-r, ${themeColor}, ${themeColor}cc)`}
                _hover={{ 
                        bgGradient: `linear(to-r, ${themeColor}cc, ${themeColor})`,
                        transform: 'translateY(-1px)',
                        boxShadow: 'md'
                }}
                _active={{
                  transform: 'translateY(0)',
                        boxShadow: 'sm'
                }}
                transition="all 0.2s"
              >
                      Aplicar
              </Button>
                  </Flex>
                  {coupon && (
                    <Flex mt={3} justifyContent="space-between" alignItems="center" bg="green.50" p={3} borderRadius="md">
                      <Text fontSize="sm" fontWeight="bold" color="green.600">
                        Cupom {coupon.code} aplicado: 
                        {coupon.type === 'percentage' 
                          ? ` ${coupon.value}% de desconto` 
                          : ` R$ ${coupon.value.toFixed(2)} de desconto`}
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeCoupon()}
                        _hover={{
                          bg: 'red.50'
                        }}
                      >
                        Remover
                      </Button>
                    </Flex>
                  )}
                </FormControl>
              </Box>

              {/* Resumo do pedido */}
              <Box 
                width="100%" 
                p={4} 
                bg="gray.50" 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="gray.200"
                mt={4}
              >
                <Heading size="sm" mb={3}>Resumo do Pedido</Heading>
                <Flex justify="space-between" width="100%" mb={2}>
                  <Text>Subtotal:</Text>
                  <Text>
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(totalPrice)}
                  </Text>
                </Flex>
                
                {discount > 0 && (
                  <Flex justify="space-between" width="100%" mb={2} color="green.500">
                    <Text>Desconto:</Text>
                    <Text>
                      - {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(discount)}
                    </Text>
                  </Flex>
                )}
                
                <Divider my={2} />
                
                <Flex justify="space-between" width="100%" fontWeight="bold">
                  <Text>Total:</Text>
                  <Text color={themeColor}>
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(finalPrice)}
                  </Text>
                </Flex>
              </Box>

              <Button 
                colorScheme="blue" 
                width="100%"
                type="submit"
                height="48px"
                fontWeight="bold"
                bgGradient={`linear(to-r, ${themeColor}, ${themeColor}cc)`}
                _hover={{ 
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                  bgGradient: `linear(to-r, ${themeColor}cc, ${themeColor})`
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'sm',
                  bgGradient: `linear(to-r, ${themeColor}dd, ${themeColor}ee)`
                }}
                transition="all 0.2s"
                isDisabled={!watchDelivery('deliveryMethod') || !watchDelivery('paymentMethod')}
              >
                Finalizar Pedido
              </Button>
            </VStack>
          </form>
            )}
      </CustomCheckoutModal>

      {/* Adicionar aviso de restaurante fechado */}
      {!isRestaurantOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bg="red.500"
          color="white"
          py={2}
          textAlign="center"
          zIndex={1000}
          fontWeight="bold"
        >
          ⚠️ Restaurante fechado no momento. Não é possível realizar pedidos.
        </Box>
      )}

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
            backgroundColor: isRestaurantOpen ? themeColor : 'gray.400',
            '&:hover': {
              transform: isRestaurantOpen ? 'translateY(-2px)' : 'none',
              boxShadow: isRestaurantOpen ? '0 6px 16px rgba(0,0,0,0.2)' : 'none',
              backgroundColor: isRestaurantOpen ? `${themeColor}e0` : 'gray.400',
              cursor: isRestaurantOpen ? 'pointer' : 'not-allowed'
            },
            transition: 'all 0.2s ease'
          }}
          isDisabled={!isRestaurantOpen}
          _disabled={{
            backgroundColor: 'gray.400',
            cursor: 'not-allowed',
            opacity: 0.7
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
  title,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  
  // Definir uma cor padrão para o tema
  const modalThemeColor = '#3182ce'; // Azul padrão do Chakra UI
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Impedir que cliques na modal fechem ela
    e.stopPropagation();
    onClose();
  };
  
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
        zIndex: 999999,
      }}
      onClick={handleOverlayClick}
    >
      <div 
        style={{
          position: 'relative',
          zIndex: 1000000,
          width: '95%',
          maxWidth: '550px',
          maxHeight: '90vh',
          animation: 'fadeInScale 0.2s ease-out forwards',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
        <Box 
          position="relative"
          p={6} 
          borderRadius="lg"
          maxH="90vh"
          overflowY="auto"
          sx={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${modalThemeColor} transparent`,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: modalThemeColor,
              borderRadius: '4px',
            },
          }}
        >
          <IconButton
            aria-label="Fechar"
            icon={<Box as="span" fontSize="lg" fontWeight="bold">✕</Box>}
            position="absolute"
            right="10px"
            top="10px"
            size="sm"
            borderRadius="full"
            bg="gray.100"
            onClick={onClose}
            zIndex={2}
          />
          
          <Heading size="lg" mb={6} mt={2}>
            {title}
          </Heading>

        {children}
        </Box>
      </div>
    </div>,
    document.body
  );
};

// Adicionar esta função antes do return principal do componente
// Função para processar os additionalOptions e garantir que eles sejam do tipo correto
const getProcessedOptionGroups = (options: any): OptionGroup[] => {
  // Log para depuração
  console.log('getProcessedOptionGroups recebeu:', options, 'do tipo:', typeof options);
  
  // Caso 1: Se for null/undefined, retornar array vazio
  if (!options) {
    return [];
  }
  
  // Caso 2: Se já for um array, verificar se é um array válido de grupos
  if (Array.isArray(options)) {
    // Verificar se o array tem estrutura válida de grupos
    const validGroups = options.filter(group => 
      group && 
      typeof group === 'object' && 
      'name' in group && 
      'options' in group && 
      Array.isArray(group.options)
    );
    
    if (validGroups.length > 0) {
      console.log('Processando array válido com', validGroups.length, 'grupos:', validGroups);
      return validGroups;
    } else {
      console.warn('Array recebido não contém grupos válidos:', options);
      return [];
    }
  }
  
  // Caso 3: Se for uma string, tentar fazer o parse
  if (typeof options === 'string') {
    // Se for string vazia, retornar array vazio
    if (options.trim() === '') {
      return [];
    }
    
    try {
      const parsedData = JSON.parse(options);
      
      // Se o resultado do parse for um array, processar como array
      if (Array.isArray(parsedData)) {
        const validGroups = parsedData.filter(group => 
          group && 
          typeof group === 'object' && 
          'name' in group && 
          'options' in group && 
          Array.isArray(group.options)
        );
        
        if (validGroups.length > 0) {
          console.log('String parseada para array válido com', validGroups.length, 'grupos:', validGroups);
          return validGroups;
        } else {
          console.warn('String parseada para array, mas sem grupos válidos:', parsedData);
          return [];
        }
      }
      
      // Se o resultado do parse for um objeto único, verificar se é um grupo válido
      if (parsedData && typeof parsedData === 'object' && 'name' in parsedData && 'options' in parsedData && Array.isArray(parsedData.options)) {
        console.log('String parseada para um único grupo válido:', parsedData);
        return [parsedData];
      }
      
      console.warn('String parseada, mas não contém estrutura válida de grupos:', parsedData);
      return [];
    } catch (error) {
      console.error('Erro ao parsear string de additionalOptions:', error);
      return [];
    }
  }
  
  // Caso 4: Se for um objeto, verificar se é um grupo único válido
  if (options && typeof options === 'object') {
    if ('name' in options && 'options' in options && Array.isArray(options.options)) {
      console.log('Objeto único convertido para array de um grupo:', options);
      return [options];
    }
    
    // Verificar se alguma propriedade do objeto é um grupo válido
    const validGroups = Object.values(options).filter(value => 
      value && 
      typeof value === 'object' && 
      'name' in value && 
      'options' in value && 
      Array.isArray(value.options)
    );
    
    if (validGroups.length > 0) {
      console.log('Objeto com', validGroups.length, 'grupos válidos extraídos:', validGroups);
      return validGroups as OptionGroup[];
    }
  }
  
  // Nenhum dos casos acima, retornar array vazio
  console.warn('Impossível processar additionalOptions, tipo ou formato não suportado:', options);
  return [];
};

export default Menu;
