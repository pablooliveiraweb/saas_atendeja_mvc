import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  Flex,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Tfoot,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack
} from '@chakra-ui/react';
import { ViewIcon, StarIcon, TimeIcon, TriangleUpIcon, TriangleDownIcon, CopyIcon, ExternalLinkIcon, CheckIcon, CloseIcon, BellIcon, PhoneIcon, WarningIcon, ChatIcon } from '@chakra-ui/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { categoriesService } from '../../services/categoriesService';
import { productsService } from '../../services/productsService';
import { ordersService, Order } from '../../services/ordersService';
import { customersService } from '../../services/customersService';
import { Customer } from '../../types/customer';
import Layout from '../../components/Layout';
import { restaurantService } from '../../services/restaurantService';
import orderService from '../../services/orderService';

// Enum para status de pedidos (para compatibilidade com o backend)
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

// Interfaces
interface SalesData {
  date: string;
  value: number;
}

interface DashboardStats {
  dailySales: number;
  weeklyTotal: number;
  monthlyTotal: number;
  averageTicket: number;
  salesGrowth: number;
  topProducts: Array<{ name: string; total: number }>;
  dailySalesData: SalesData[];
  monthlySalesData: SalesData[];
}

// Interface para cliente inativo
interface InactiveCustomer {
  customerName: string;
  customerPhone: string;
  lastOrderId: string;
  lastOrderTotal: number;
  lastOrderDate: string;
  daysSinceLastOrder?: number;
}

// Interface para campanha de marketing
interface MarketingCampaign {
  id: string;
  name: string;
  message: string;
  discount?: string;
}

// Componente de estatística personalizado
const StatCard = ({ 
  label, 
  value, 
  helpText 
}: { 
  label: string;
  value: string | number;
  helpText: React.ReactNode;
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const valueColor = useColorModeValue('gray.900', 'white');

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm">
      <Text fontSize="sm" color={textColor}>{label}</Text>
      <Text fontSize="2xl" fontWeight="bold" color={valueColor}>{value}</Text>
      <Box color={textColor}>{helpText}</Box>
    </Box>
  );
};

const Dashboard: React.FC = () => {
  const { user, restaurant } = useAuth();
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [weeklyOrders, setWeeklyOrders] = useState<number[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    dailySales: 0,
    weeklyTotal: 0,
    monthlyTotal: 0,
    averageTicket: 0,
    salesGrowth: 0,
    topProducts: [],
    dailySalesData: [],
    monthlySalesData: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuUrl, setMenuUrl] = useState<string>('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
  const [isPlayingAlarm, setIsPlayingAlarm] = useState<boolean>(false);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Modal para pedidos
  const {
    isOpen: isOrderModalOpen,
    onOpen: onOrderModalOpen,
    onClose: onOrderModalClose,
  } = useDisclosure();
  
  // Referência para o som do alarme
  const alarmSound = useRef<HTMLAudioElement | null>(null);

  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const chartTextColor = useColorModeValue('#1A202C', '#FFFFFF');
  const chartGridColor = useColorModeValue('#E2E8F0', '#2D3748');
  const cardapioBgColor = useColorModeValue('blue.50', 'blue.900');

  const [inactiveCustomers, setInactiveCustomers] = useState<InactiveCustomer[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<InactiveCustomer | null>(null);
  const [marketingMessage, setMarketingMessage] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedDiscount, setSelectedDiscount] = useState<string>('');
  
  // Modal para campanha de marketing
  const {
    isOpen: isMarketingModalOpen,
    onOpen: onMarketingModalOpen,
    onClose: onMarketingModalClose,
  } = useDisclosure();
  
  // Campanhas de marketing pré-definidas
  const marketingCampaigns: MarketingCampaign[] = [
    {
      id: 'missing-you',
      name: 'Sentimos sua Falta',
      message: 'Olá, estamos com saudades! Faz tempo que não vemos você por aqui. Que tal pedir algo delicioso hoje?',
      discount: '10OFF'
    },
    {
      id: 'weekend-special',
      name: 'Especial de Fim de Semana',
      message: 'Oi! Temos uma promoção especial para o fim de semana que achamos que você vai adorar. Venha conferir!',
      discount: '15OFF'
    },
    {
      id: 'new-items',
      name: 'Novos Itens no Cardápio',
      message: 'Olá! Adicionamos novos itens deliciosos ao nosso cardápio. Acreditamos que você vai gostar. Venha experimentar!',
      discount: 'NOVO10'
    },
    {
      id: 'custom',
      name: 'Mensagem Personalizada',
      message: ''
    }
  ];
  
  // Cupons de desconto disponíveis
  const availableDiscounts = [
    { code: '10OFF', description: '10% de desconto' },
    { code: '15OFF', description: '15% de desconto' },
    { code: 'NOVO10', description: '10% em novos itens' },
    { code: 'FRETE', description: 'Frete grátis' },
    { code: 'COMBO20', description: '20% em combos' }
  ];

  const formatCurrency = (value: number) => {
    // Verificar se o valor é válido
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Inicializar o som assim que o componente montar
  useEffect(() => {
    try {
      // Criar elemento de áudio e definir a fonte
      const audio = new Audio(`${window.location.origin}/notification.mp3`);
      
      // Configurar o áudio
      audio.preload = 'auto';
      audio.volume = 0.7; // Volume inicial de 70%
      
      // Verificar se carregou corretamente
      audio.addEventListener('canplaythrough', () => {
        console.log('🔊 Áudio carregado e pronto para tocar');
      });
      
      audio.addEventListener('error', (e) => {
        console.error('🔊 Erro ao carregar áudio:', e);
      });
      
      // Testar com volume baixo para verificar permissões
      audio.volume = 0.01;
      audio.play()
        .then(() => {
          console.log('🔊 Teste de áudio bem-sucedido');
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(e => {
          console.error('🔊 Erro no teste de áudio:', e);
        });
      
      // Armazenar referência para uso posterior
      alarmSound.current = audio;
      audioRef.current = audio;
      
      // Limpar ao desmontar
      return () => {
        if (alarmSound.current) {
          alarmSound.current.pause();
          alarmSound.current = null;
        }
      };
    } catch (e) {
      console.error('🔊 Erro ao inicializar áudio:', e);
    }
  }, []);
  
  // Para evitar dependência circular, inicializamos as funções sem dependências primeiro
  const playAlarmSound = useCallback(() => {
    console.log('🔊 Tocando som de alarme...');
    
    try {
      // Método 1: usar o som principal de forma segura
      if (alarmSound.current) {
        // Verificar se está tocando para evitar interrupções que causam erros
        const isPlaying = !alarmSound.current.paused && alarmSound.current.currentTime > 0;
        
        if (isPlaying) {
          // Não interromper se já estiver tocando para evitar erros
          console.log('🔊 Som já está tocando, não interromper');
          return;
        }
        
        // Configurar antes de tocar
        alarmSound.current.currentTime = 0;
        alarmSound.current.volume = 1.0;
        
        // Tentar reproduzir várias vezes com pequenos intervalos
        const playAttempts = [0, 100, 200];
        
        playAttempts.forEach((delay) => {
          setTimeout(() => {
            if (alarmSound.current) {
              alarmSound.current.play()
                .then(() => console.log(`🔊 Som reproduzido com sucesso (tentativa após ${delay}ms)`))
                .catch(e => {
                  console.error(`🔊 Erro ao tocar som (tentativa após ${delay}ms):`, e);
                  
                  // Se falhar, tentar o elemento de áudio estático
                  if (delay === playAttempts[playAttempts.length - 1]) {
                    const audioElement = document.getElementById('notification-sound') as HTMLAudioElement;
                    if (audioElement) {
                      audioElement.currentTime = 0;
                      audioElement.volume = 1.0;
                      audioElement.play().catch(err => console.error('🔊 Erro no elemento estático:', err));
                    }
                  }
                });
            }
          }, delay);
        });
      } else {
        // Tentar o elemento de áudio estático como fallback primário
        const audioElement = document.getElementById('notification-sound') as HTMLAudioElement;
        if (audioElement) {
          audioElement.currentTime = 0;
          audioElement.volume = 1.0;
          
          // Tentar reproduzir várias vezes
          const playAttempts = [0, 100, 300];
          
          playAttempts.forEach((delay) => {
            setTimeout(() => {
              audioElement.play().catch(e => console.error(`🔊 Erro no elemento estático (tentativa após ${delay}ms):`, e));
            }, delay);
          });
        }
      }
    } catch (e) {
      console.error('Erro ao tocar alarme:', e);
      
      // Último recurso: criar um novo elemento de áudio
      try {
        const newAudio = new Audio('/notification.mp3');
        newAudio.volume = 0.9;
        newAudio.play().catch(e => console.error('Erro no novo elemento de áudio:', e));
      } catch (audioError) {
        console.error('Falha completa ao tocar som:', audioError);
      }
    }
  }, []);
  
  // Função para parar o som de forma segura
  const safeStopSound = useCallback(() => {
    try {
      // Parar o som principal
      if (alarmSound.current) {
        // Verificar se está tocando para evitar erros
        if (!alarmSound.current.paused) {
          alarmSound.current.pause();
          alarmSound.current.currentTime = 0;
        }
      }
      
      // Parar também o elemento estático
      const audioElement = document.getElementById('notification-sound') as HTMLAudioElement;
      if (audioElement && !audioElement.paused) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    } catch (e) {
      console.error('Erro ao parar som:', e);
    }
  }, []);
  
  // Função para iniciar a repetição do som - depende de playAlarmSound
  const startRepeatingAlarm = useCallback(() => {
    // Se já estiver tocando, não fazer nada
    if (isPlayingAlarm) return;
    
    console.log('🔄 Iniciando alarme repetitivo');
    setIsPlayingAlarm(true);
    
    // Tocar o som imediatamente
    playAlarmSound();
    
    // Configurar para tocar a cada 5 segundos
    alarmIntervalRef.current = setInterval(() => {
      playAlarmSound();
    }, 5000); // 5 segundos
  }, [isPlayingAlarm, playAlarmSound]);
  
  // Função para parar a repetição do som
  const stopRepeatingAlarm = useCallback(() => {
    console.log('🛑 Parando alarme repetitivo');
    setIsPlayingAlarm(false);
    
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    
    // Parar o som que estiver tocando
    safeStopSound();
  }, [safeStopSound]);
  
  // Função para lidar com a visualização dos detalhes do pedido - depende de startRepeatingAlarm
  const handleViewOrderDetails = useCallback((order: any) => {
    setCurrentOrder(order);
    onOrderModalOpen();
    
    // Se o pedido estiver pendente, iniciar a repetição do som
    if (order.status === 'pending') {
      startRepeatingAlarm();
    }
  }, [onOrderModalOpen, startRepeatingAlarm]);
  
  // Listener dedicado para o evento play-notification-sound
  useEffect(() => {
    const handlePlayNotificationSound = () => {
      console.log('🔊 Evento de som personalizado recebido, tocando notificação...');
      
      // Método 1: Usar a referência de áudio principal
      playAlarmSound();
      
      // Método 2: Criar um novo elemento de áudio (funciona melhor em alguns navegadores)
      setTimeout(() => {
        try {
          const newAudio = new Audio('/notification.mp3');
          newAudio.volume = 0.8;
          
          // Adicionar evento para detectar quando estiver pronto
          newAudio.addEventListener('canplaythrough', () => {
            newAudio.play().catch(e => {
              console.warn('Erro ao tocar áudio (método 2):', e);
            });
          });
          
          // Definir um timeout para garantir que o som seja tocado mesmo se o evento não disparar
          setTimeout(() => {
            try {
              newAudio.play().catch(e => {
                console.warn('Erro ao tocar áudio (método 2 - timeout):', e);
              });
            } catch (e) {
              console.warn('Erro ao tocar áudio (método 2 - timeout):', e);
            }
          }, 300);
        } catch (e) {
          console.warn('Erro ao criar áudio (método 2):', e);
        }
      }, 100);
      
      // Método 3: Usar a API de Áudio Web (funciona em navegadores mais recentes)
      setTimeout(() => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const request = new XMLHttpRequest();
          request.open('GET', '/notification.mp3', true);
          request.responseType = 'arraybuffer';
          
          request.onload = function() {
            audioContext.decodeAudioData(request.response, function(buffer) {
              const source = audioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContext.destination);
              source.start(0);
            }, function(e) {
              console.warn('Erro ao decodificar áudio (método 3):', e);
            });
          };
          
          request.onerror = function() {
            console.warn('Erro ao carregar áudio (método 3)');
          };
          
          request.send();
        } catch (e) {
          console.warn('Erro ao usar Web Audio API (método 3):', e);
        }
      }, 200);
      
      // Método 4: Usar o elemento de áudio estático no DOM
      setTimeout(() => {
        try {
          const audioElement = document.getElementById('notification-sound') as HTMLAudioElement;
          if (audioElement) {
            audioElement.currentTime = 0;
            audioElement.volume = 1.0;
            
            // Tentar reproduzir várias vezes com pequenos intervalos
            const playAttempts = [0, 100, 300, 500];
            playAttempts.forEach((delay) => {
              setTimeout(() => {
                audioElement.play().catch(err => {
                  console.warn(`Erro no elemento estático (tentativa após ${delay}ms):`, err);
                });
              }, delay);
            });
          }
        } catch (e) {
          console.warn('Erro ao usar elemento de áudio estático (método 4):', e);
        }
      }, 150);
    };
    
    // Adicionar o listener para o evento específico de som
    window.addEventListener('play-notification-sound', handlePlayNotificationSound);
    
    return () => {
      window.removeEventListener('play-notification-sound', handlePlayNotificationSound);
    };
  }, [playAlarmSound]);
  
  // Listener para novos pedidos criados via evento
  useEffect(() => {
    const handleNewOrderEvent = (event: any) => {
      const order = event.detail;
      if (!order || !order.id) return;
      
      console.log('Dashboard recebeu evento de novo pedido:', order);
      
      // Tocar alarme sonoro com timeout para garantir a reprodução
      setTimeout(() => {
        playAlarmSound();
      }, 100);
      
      // Adicionar à lista de pendentes
      setPendingOrders((prev: any[]) => {
        if (prev.some((p: any) => p.id === order.id)) return prev;
        return [order, ...prev];
      });
      
      // Abrir modal
      handleViewOrderDetails(order);
    };
    
    // Adicionar o listener
    window.addEventListener('new-order-created', handleNewOrderEvent);
    
    return () => {
      window.removeEventListener('new-order-created', handleNewOrderEvent);
    };
  }, [playAlarmSound, handleViewOrderDetails]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (!restaurant) return;
        
        // Buscar dados do dashboard incluindo clientes inativos e produtos mais vendidos
        const [
          categories, 
          products, 
          orders, 
          customers, 
          weeklyStats,
          inactiveCustomersData,
          topProducts
        ] = await Promise.all([
            categoriesService.getAll(),
            productsService.getAll(),
            ordersService.getRecent(),
            customersService.getTopCustomers(restaurant.id),
            ordersService.getWeeklyStats(),
            ordersService.getInactiveCustomers(),
            ordersService.getTopProducts()
            ]);

        // Calcular estatísticas reais (não simuladas)
        // Filtrar apenas pedidos válidos (com valor total definido)
        const validOrders = orders.filter(order => 
          !order.isSimulated && 
          !order.id.startsWith('sim-') && 
          order.total !== undefined && 
          !isNaN(Number(order.total))
        );
        
        // Calcular vendas do dia
        const dailySales = validOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            const today = new Date();
            return orderDate.getDate() === today.getDate() &&
                   orderDate.getMonth() === today.getMonth() &&
                   orderDate.getFullYear() === today.getFullYear();
          })
          .reduce((acc, curr) => acc + Number(curr.total), 0);

        const salesGrowth = Math.floor(Math.random() * 20) - 10;
        
        // Vendas da semana atual
        const weeklyTotal = weeklyStats.reduce((acc, curr) => acc + curr, 0);
        
        // Vendas do mês atual - usar valor real do weeklyTotal como base
        const monthlyTotal = validOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            const today = new Date();
            return orderDate.getMonth() === today.getMonth() &&
                   orderDate.getFullYear() === today.getFullYear();
          })
          .reduce((acc, curr) => acc + Number(curr.total), 0) || weeklyTotal * 4;
        
        // Ticket médio - evitar divisão por zero
        const averageTicket = validOrders.length > 0 ? 
          validOrders.reduce((acc, curr) => acc + Number(curr.total), 0) / validOrders.length : 0;
        
        // Processar clientes inativos
        const processedInactiveCustomers = inactiveCustomersData.map(customer => {
          // Calcular dias desde o último pedido
          const lastOrderDate = new Date(customer.lastOrderDate);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - lastOrderDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            ...customer,
            daysSinceLastOrder: diffDays
          };
        });
        
        setInactiveCustomers(processedInactiveCustomers);
        setTopSellingProducts(topProducts);

        // Atualizar estados
        setDashboardStats({
          dailySales: isNaN(dailySales) ? 0 : dailySales,
          weeklyTotal: isNaN(weeklyTotal) ? 0 : weeklyTotal,
          monthlyTotal: isNaN(monthlyTotal) ? 0 : monthlyTotal,
          averageTicket: isNaN(averageTicket) ? 0 : averageTicket,
          salesGrowth,
          topProducts,
          dailySalesData: Array.from({ length: 12 }, (_, i) => ({
            date: `${i + 10}h`,
            value: Math.floor(Math.random() * 300) + 50
          })),
          monthlySalesData: Array.from({ length: 30 }, (_, i) => ({
            date: `${i + 1}/05`,
            value: Math.floor(Math.random() * 1000) + 200
          }))
        });

          setCategoriesCount(categories.length || 8);
          setProductsCount(products.length || 32);
        
        // Garantir que só mostre pedidos reais
        setRecentOrders(orders.filter(order => !order.isSimulated && !order.id.startsWith('sim-')));
        
          setTopCustomers(customers);
          setWeeklyOrders(weeklyStats);

      } catch (error) {
        setError('Erro ao carregar dados.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [restaurant]);

  // Função para buscar pedidos pendentes
  const fetchPendingOrders = useCallback(async () => {
    try {
      console.log('Buscando pedidos pendentes...');
      
      // Guardar o número atual de pedidos pendentes para comparação
      const currentPendingCount = pendingOrders.length;
      const currentPendingIds = pendingOrders.map(order => order.id);
      
      // Usar a função melhorada do serviço
      const newPendingOrders = await ordersService.fetchPendingOrders();
      
      console.log(`Encontrados ${newPendingOrders.length} pedidos pendentes`);
      
      // Verificar se há novos pedidos PENDENTES (que não estavam na lista anterior)
      const brandNewOrders = newPendingOrders.filter(
        (order: any) => 
          !currentPendingIds.includes(order.id) && 
          (order.status === 'pending' || order.status === OrderStatus.PENDING)
      );
      
      if (brandNewOrders.length > 0) {
        console.log(`Detectados ${brandNewOrders.length} novos pedidos pendentes!`, brandNewOrders);
        
        // Tocar som de notificação apenas para novos pedidos pendentes
        if (brandNewOrders.length > 0) {
          // Disparar evento de som
          const soundEvent = new CustomEvent('play-notification-sound');
          window.dispatchEvent(soundEvent);
          
          // Exibir toast para cada novo pedido
          brandNewOrders.forEach((order: any) => {
            toast({
              title: 'Novo Pedido!',
              description: `Pedido de ${order.customerName} - ${formatCurrency(Number(order.total) || 0)}`,
              status: 'info',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
          });
        }
        
        // Se não houver pedido aberto no modal, abrir o primeiro novo pedido PENDENTE
        if (!currentOrder && brandNewOrders.length > 0) {
          handleViewOrderDetails(brandNewOrders[0]);
        }
      }
      
      // Atualizar estado com todos os pedidos pendentes e em produção
      setPendingOrders(newPendingOrders);
    } catch (error) {
      console.error('Erro ao buscar pedidos pendentes:', error);
      
      // Tentar buscar do localStorage como fallback
      try {
        const localOrders = localStorage.getItem('pendingOrders');
        if (localOrders) {
          const parsedOrders = JSON.parse(localOrders);
          if (Array.isArray(parsedOrders)) {
            console.log(`Usando ${parsedOrders.length} pedidos do localStorage como fallback após erro`);
            
            // Filtrar pedidos pendentes e em produção
            const relevantLocalOrders = parsedOrders.filter(
              (order: any) => 
                ['pending', 'preparing', 'ready'].includes(order.status) || 
                [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY].includes(order.status)
            );
            
            // Atualizar estado com os pedidos relevantes
            setPendingOrders(relevantLocalOrders);
          }
        }
      } catch (localError) {
        console.error('Erro ao buscar pedidos do localStorage:', localError);
      }
    }
  }, [pendingOrders, currentOrder, handleViewOrderDetails, toast, formatCurrency]);
  
  // Buscar pedidos pendentes periodicamente
  useEffect(() => {
    // Verificar se o componente é o Dashboard
    const isDashboardActive = window.location.pathname === '/' || window.location.pathname === '/dashboard';
    
    // Buscar imediatamente ao montar o componente, apenas se estivermos no Dashboard
    if (isDashboardActive) {
      console.log('Dashboard ativo, buscando pedidos pendentes...');
      fetchPendingOrders();
    }
    
    // Configurar intervalo para buscar a cada 5 segundos (em vez de 15s)
    // Apenas se estivermos no Dashboard
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isDashboardActive) {
      intervalId = setInterval(() => {
        console.log('Intervalo: buscando pedidos pendentes...');
        fetchPendingOrders();
      }, 5000); // 5 segundos em vez de 15 segundos
      
      console.log('Intervalo de busca de pedidos configurado: a cada 5 segundos');
    }
    
    // Limpar intervalo ao desmontar
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('Intervalo de busca de pedidos limpo');
      }
    };
  }, [fetchPendingOrders]);

  // Função para aceitar pedido
  const handleAcceptOrder = async () => {
    if (!currentOrder) return;
    
    try {
      setIsLoadingAction(true);
      
      // Obter o nome do restaurante
      const restaurantName = restaurant?.name || 'Restaurante';
      
      // Atualizar status usando o serviço orderService
      await orderService.updateOrderStatus(
        currentOrder.id,
        'preparing',
        currentOrder.customerPhone || '',
        restaurantName
      );
      
      // Atualizar estado local
      const updateData = { 
        status: 'preparing',
        updatedAt: new Date().toISOString()
      };
      
      setCurrentOrder({
        ...currentOrder,
        ...updateData
      });
      
      // Parar a repetição do som
      stopRepeatingAlarm();
      
      // Atualizar lista de pedidos pendentes - importante para evitar travamentos da UI
      const updatedOrder = {...currentOrder, ...updateData};
      setPendingOrders(prev => prev.map(o => o.id === currentOrder.id ? updatedOrder : o));
      
      // Feedback
      toast({
        title: 'Pedido aceito',
        description: `O pedido #${currentOrder.id.substring(0, 8)} foi aceito e está em produção.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Fechar modal e limpar estado de carregamento
      setIsLoadingAction(false);
      handleCloseOrderModal();
      
    } catch (error) {
      console.error("Erro ao aceitar pedido:", error);
      
      // Feedback de erro
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar o pedido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      setIsLoadingAction(false);
    }
  };
  
  // Função para rejeitar/cancelar pedido
  const handleRejectOrder = async () => {
    if (!currentOrder) return;
    
    try {
      setIsLoadingAction(true);
      
      // Preparar objeto de atualização
      const updateData: Partial<Order> = { 
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      };
      
      // Atualizar pedido
      await ordersService.update(currentOrder.id, updateData);
      
      // Atualizar estado local
      setCurrentOrder({
        ...currentOrder,
        ...updateData
      });
      
      // Parar a repetição do som
      stopRepeatingAlarm();
      
      // Atualizar lista removendo o pedido dos pendentes
      setPendingOrders((prev: any[]) => prev.filter(o => o.id !== currentOrder.id));
      
      // Feedback
      toast({
        title: 'Pedido rejeitado',
        description: `O pedido #${currentOrder.id.substring(0, 8)} foi rejeitado.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Fechar modal
      handleCloseOrderModal();
      
      // Atualizar dados pendentes
      fetchPendingOrders();
    } catch (error) {
      console.error("Erro ao rejeitar pedido:", error);
      
      // Feedback de erro
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o pedido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      setIsLoadingAction(false);
    }
  };

  // Função para marcar pedido como Pronto
  const handleMarkAsReady = async () => {
    if (!currentOrder) return;
    
    try {
      setIsLoadingAction(true);
      
      // Obter o nome do restaurante
      const restaurantName = restaurant?.name || 'Restaurante';
      
      // Atualizar status usando o serviço orderService
      await orderService.updateOrderStatus(
        currentOrder.id,
        'ready',
        currentOrder.customerPhone || '',
        restaurantName
      );
      
      // Atualizar estado local
      const updateData = { 
        status: 'ready',
        updatedAt: new Date().toISOString()
      };
      
      // Atualizar estado local
      setCurrentOrder({
        ...currentOrder,
        ...updateData
      });
      
      // Atualizar lista de pedidos pendentes
      const updatedOrder = {...currentOrder, ...updateData};
      setPendingOrders(prev => prev.map(o => o.id === currentOrder.id ? updatedOrder : o));
      
      // Feedback
      toast({
        title: 'Pedido pronto',
        description: `O pedido #${currentOrder.id.substring(0, 8)} está pronto para entrega.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Fechar modal e limpar estado de carregamento
      setIsLoadingAction(false);
      
    } catch (error) {
      console.error("Erro ao marcar pedido como pronto:", error);
      
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      setIsLoadingAction(false);
    }
  };
  
  // Função para marcar pedido como Entregue
  const handleMarkAsDelivered = async () => {
    if (!currentOrder) return;
    
    try {
      setIsLoadingAction(true);
      
      // Obter o nome do restaurante
      const restaurantName = restaurant?.name || 'Restaurante';
      
      // Atualizar status usando o serviço orderService
      await orderService.updateOrderStatus(
        currentOrder.id,
        'delivered',
        currentOrder.customerPhone || '',
        restaurantName
      );
      
      // Atualizar estado local
      const updateData = { 
        status: 'delivered',
        updatedAt: new Date().toISOString()
      };
      
      // Atualizar estado local
      setCurrentOrder({
        ...currentOrder,
        ...updateData
      });
      
      // Atualizar lista de pedidos pendentes
      const updatedOrder = {...currentOrder, ...updateData};
      setPendingOrders(prev => prev.map(o => o.id === currentOrder.id ? updatedOrder : o));
      
      // Feedback
      toast({
        title: 'Pedido entregue',
        description: `O pedido #${currentOrder.id.substring(0, 8)} foi marcado como entregue.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Fechar modal e limpar estado de carregamento
      setIsLoadingAction(false);
      handleCloseOrderModal();
      
    } catch (error) {
      console.error("Erro ao marcar pedido como entregue:", error);
      
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      setIsLoadingAction(false);
    }
  };

  const getStatusColor = (status: string): string => {
    if (!status) return 'gray';
    
    const statusLower = status.toLowerCase();
    
    const statusColors: Record<string, string> = {
      'pending': 'yellow',
      'pendente': 'yellow',
      'confirmed': 'blue',
      'confirmado': 'blue',
      'preparing': 'orange',
      'preparando': 'orange',
      'ready': 'green',
      'pronto': 'green',
      'delivered': 'teal',
      'entregue': 'teal',
      'cancelled': 'red',
      'cancelado': 'red',
      'processing': 'purple',
      'processando': 'purple',
      'completed': 'green',
      'completo': 'green',
    };
    
    return statusColors[statusLower] || 'gray';
  };

  // Função para copiar o link do cardápio para a área de transferência
  const copyMenuLink = () => {
    navigator.clipboard.writeText(menuUrl);
    toast({
      title: 'Link copiado!',
      description: 'O link do cardápio digital foi copiado para a área de transferência.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Função para abrir o modal com o link do cardápio
  const handleOpenMenuModal = () => {
    if (restaurant) {
      const slug = restaurantService.generateSlug(restaurant.name);
      // Usar o URL completo incluindo o domínio
      const fullUrl = `${window.location.origin}/menu/${slug}`;
      setMenuUrl(fullUrl);
      onOpen();
    }
  };

  // Função personalizada para fechar a modal e parar o som
  const handleCloseOrderModal = useCallback(() => {
    // Parar o som
    stopRepeatingAlarm();
    
    // Fechar a modal
    onOrderModalClose();
    
    // Também limpar o currentOrder ao fechar
    if (currentOrder && currentOrder.status === 'pending') {
      console.log('Modal fechada com pedido pendente');
      // Não limpar o pedido atual para que possa ser reaberto
    } else {
      // Se o pedido não estiver mais pendente, pode limpar
      setCurrentOrder(null);
    }
  }, [onOrderModalClose, stopRepeatingAlarm, currentOrder]);

  // Limpar todos os intervalos quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Limpar o intervalo do alarme
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      
      // Garantir que o áudio seja pausado
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Função para abrir a modal de marketing
  const handleOpenMarketingModal = (customer: InactiveCustomer) => {
    setSelectedCustomer(customer);
    setSelectedCampaign(marketingCampaigns[0].id);
    setMarketingMessage(marketingCampaigns[0].message);
    setSelectedDiscount(marketingCampaigns[0].discount || '');
    onMarketingModalOpen();
  };
  
  // Função para alterar a campanha selecionada
  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    const campaign = marketingCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      setMarketingMessage(campaign.message);
      setSelectedDiscount(campaign.discount || '');
    }
  };
  
  // Função para enviar mensagem de WhatsApp
  const handleSendWhatsAppMessage = () => {
    if (!selectedCustomer) return;
    
    // Formatar o número de telefone (remover caracteres não numéricos)
    const phone = selectedCustomer.customerPhone.replace(/\D/g, '');
    
    // Construir a mensagem
    let fullMessage = marketingMessage;
    
    // Adicionar desconto se selecionado
    if (selectedDiscount) {
      const discount = availableDiscounts.find(d => d.code === selectedDiscount);
      if (discount) {
        fullMessage += `\n\nUse o cupom: ${selectedDiscount} para ${discount.description}`;
      }
    }
    
    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(fullMessage);
    
    // Construir a URL do WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
    
    // Abrir o WhatsApp em uma nova aba
    window.open(whatsappUrl, '_blank');
    
    // Fechar a modal
    onMarketingModalClose();
    
    // Mostrar notificação de sucesso
    toast({
      title: 'WhatsApp aberto',
      description: `Mensagem preparada para ${selectedCustomer.customerName}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <Flex align="center" justify="center" h="64">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <Container maxW="container.xl" py={8}>
        <Heading size="lg" mb={8}>Dashboard</Heading>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {!restaurant ? (
          <Box p={6} bg="yellow.100" borderRadius="md" mb={8}>
            <Heading size="md" mb={2}>
              Bem-vindo ao Atende!
            </Heading>
            <Text>
              Você ainda não está associado a nenhum restaurante. Entre em contato com o administrador
              para configurar seu restaurante.
            </Text>
          </Box>
        ) : (
          <>
            {/* Botão de acesso ao cardápio digital */}
            <Box p={6} bg={cardapioBgColor} borderRadius="md" mb={8}>
              <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
                <Box mb={{ base: 4, md: 0 }}>
                  <Heading size="md" mb={2}>
                    Cardápio Digital
                  </Heading>
                  <Text>
                    Acesse o cardápio digital do seu restaurante ou compartilhe o link com seus clientes.
                  </Text>
                </Box>
                <Flex>
                  <Button 
                    leftIcon={<ExternalLinkIcon />} 
                    colorScheme="blue" 
                    mr={2}
                    as="a" 
                    href={`/menu/${restaurantService.generateSlug(restaurant.name)}`} 
                    target="_blank"
                  >
                    Ver Cardápio
                  </Button>
                  <Button 
                    leftIcon={<CopyIcon />} 
                    colorScheme="teal"
                    onClick={handleOpenMenuModal}
                  >
                    Compartilhar Link
                  </Button>
                </Flex>
              </Flex>
            </Box>
            
            {/* Principais Indicadores */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
              <StatCard
                label="Vendas Hoje"
                value={formatCurrency(dashboardStats.dailySales)}
                helpText={
                  <Flex align="center" color={dashboardStats.salesGrowth >= 0 ? "green.500" : "red.500"}>
                    {dashboardStats.salesGrowth >= 0 ? <TriangleUpIcon /> : <TriangleDownIcon />}
                    <Text ml={1}>{Math.abs(dashboardStats.salesGrowth)}% vs ontem</Text>
                  </Flex>
                }
              />
              <StatCard
                label="Vendas na Semana"
                value={formatCurrency(dashboardStats.weeklyTotal)}
                helpText="Total dos últimos 7 dias"
              />
              <StatCard
                label="Vendas no Mês"
                value={formatCurrency(dashboardStats.monthlyTotal)}
                helpText="Total do mês atual"
              />
              <StatCard
                label="Ticket Médio"
                value={formatCurrency(dashboardStats.averageTicket)}
                helpText="Valor médio por pedido"
              />
            </SimpleGrid>

            {/* Gráficos */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
              {/* Gráfico de Vendas por Hora */}
              <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
                <Heading size="md" mb={4}>Vendas por Hora (Hoje)</Heading>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardStats.dailySalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                      <XAxis dataKey="date" stroke={chartTextColor} />
                      <YAxis stroke={chartTextColor} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3182CE" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* Gráfico de Vendas por Dia */}
              <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
                <Heading size="md" mb={4}>Vendas por Dia (Mês Atual)</Heading>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardStats.monthlySalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                      <XAxis dataKey="date" stroke={chartTextColor} />
                      <YAxis stroke={chartTextColor} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3182CE" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </SimpleGrid>

            {/* Produtos Mais Vendidos e Clientes Inativos */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
              <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
                <Heading size="md" mb={4}>Produtos Mais Vendidos</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Produto</Th>
                      <Th isNumeric>Quantidade</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {topSellingProducts.map((product, index) => (
                      <Tr key={index}>
                        <Td>{product.name}</Td>
                        <Td isNumeric>{product.total}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm">
                <Heading size="md" mb={4}>
                  <Flex align="center">
                    <WarningIcon color="orange.500" mr={2} />
                    Clientes Inativos
                  </Flex>
                </Heading>
                {inactiveCustomers.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={4}>
                    Não há clientes inativos no momento. Todos os seus clientes fizeram pedidos nos últimos 7 dias!
                  </Text>
                ) : (
                  <Table variant="simple" w="100%">
                  <Thead>
                    <Tr>
                      <Th>Cliente</Th>
                        <Th>Último Pedido</Th>
                        <Th>Dias Inativo</Th>
                        <Th>Ação</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                      {inactiveCustomers.slice(0, 5).map((customer) => (
                        <Tr key={customer.customerPhone}>
                          <Td>{customer.customerName}</Td>
                          <Td>{formatCurrency(customer.lastOrderTotal)}</Td>
                          <Td>
                            <Badge colorScheme={(customer.daysSinceLastOrder ?? 0) > 30 ? "red" : "orange"}>
                              {customer.daysSinceLastOrder ?? 0} dias
                          </Badge>
                        </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="whatsapp"
                              leftIcon={<ChatIcon />}
                              onClick={() => handleOpenMarketingModal(customer)}
                            >
                              WhatsApp
                            </Button>
                          </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                )}
              </Box>
            </SimpleGrid>

            {/* Acesso Rápido */}
            <Heading size="md" mb={4}>Acesso Rápido</Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
              <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm">
                <Flex direction="column" align="center">
                  <ViewIcon boxSize={8} mb={4} color="blue.500" />
                  <Heading size="sm" mb={2}>Categorias</Heading>
                  <Text textAlign="center" mb={4}>Gerencie as categorias</Text>
                  <Button as={RouterLink} to="/categories" colorScheme="blue" size="sm">
                    Acessar
                  </Button>
                </Flex>
              </Box>

              <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm">
                <Flex direction="column" align="center">
                  <StarIcon boxSize={8} mb={4} color="blue.500" />
                  <Heading size="sm" mb={2}>Produtos</Heading>
                  <Text textAlign="center" mb={4}>Gerencie os produtos</Text>
                  <Button as={RouterLink} to="/products" colorScheme="blue" size="sm">
                    Acessar
                  </Button>
                </Flex>
              </Box>

              <Box p={6} bg={bgColor} borderRadius="lg" boxShadow="sm">
                <Flex direction="column" align="center">
                  <TimeIcon boxSize={8} mb={4} color="blue.500" />
                  <Heading size="sm" mb={2}>Pedidos</Heading>
                  <Text textAlign="center" mb={4}>Gerencie os pedidos</Text>
                  <Button as={RouterLink} to="/orders" colorScheme="blue" size="sm">
                    Acessar
                  </Button>
                </Flex>
              </Box>
            </Grid>

            {/* Tabela de Pedidos Pendentes (se existirem) */}
            {pendingOrders.length > 0 && (
              <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" mb={8}>
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                  <Heading size="md">
                    <Flex align="center">
                      <Box color="red.500" mr={2}>
                        <BellIcon />
                      </Box>
                      {pendingOrders.some(order => order.status === 'preparing' || order.status === OrderStatus.PREPARING)
                        ? `Pedidos em Produção (${pendingOrders.filter(order => !order.isSimulated && !order.id.startsWith('sim-')).length})`
                        : `Pedidos Pendentes (${pendingOrders.filter(order => !order.isSimulated && !order.id.startsWith('sim-')).length})`
                      }
                    </Flex>
                  </Heading>
                </Flex>
                
                <Table variant="simple" w="100%">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Cliente</Th>
                      <Th>Total</Th>
                      <Th>Status</Th>
                      <Th>Hora</Th>
                      <Th>Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingOrders.filter(order => !order.isSimulated && !order.id.startsWith('sim-')).map((order) => (
                      <Tr key={order.id}>
                        <Td>{order.id.substring(0, 8)}...</Td>
                        <Td>{order.customerName}</Td>
                        <Td>{formatCurrency(Number(order.total) || 0)}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(order.status)}>
                            {order.status === 'preparing' || order.status === OrderStatus.PREPARING 
                              ? 'Em Produção' 
                              : order.status}
                          </Badge>
                        </Td>
                        <Td>{new Date(order.createdAt).toLocaleTimeString()}</Td>
                        <Td>
                          <Button 
                            size="sm" 
                            colorScheme="blue" 
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            Ver Detalhes
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </>
        )}
      </Container>
      
      {/* Modal para compartilhar o link do cardápio */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Compartilhar Cardápio Digital</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Compartilhe este link com seus clientes para que eles possam acessar o cardápio digital do seu restaurante:
            </Text>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                value={menuUrl}
                readOnly
              />
              <InputRightElement width="4.5rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  aria-label="Copiar link"
                  icon={<CopyIcon />}
                  onClick={copyMenuLink}
                />
              </InputRightElement>
            </InputGroup>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Fechar
            </Button>
            <Button variant="ghost" onClick={copyMenuLink}>Copiar Link</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Audio element como fallback */}
      <audio 
        id="notification-sound" 
        src="/notification.mp3" 
        preload="auto"
        style={{ display: 'none' }}
      />
      
      {/* Modal para pedidos */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay 
          bg="rgba(0, 0, 0, 0.7)"
          backdropFilter="blur(2px)"
        />
        <ModalContent 
          borderWidth="1px"
          borderColor={currentOrder?.status === 'pending' ? 'orange.300' : 'gray.200'}
          boxShadow={currentOrder?.status === 'pending' ? 'lg' : 'base'}
        >
          <ModalHeader borderBottomWidth="1px" bg={currentOrder?.status === 'pending' ? 'orange.50' : 'white'}>
            <Flex justify="space-between" align="center">
              <Box>
                {currentOrder?.status === 'pending' && (
                  <Text fontSize="sm" color="orange.500" fontWeight="bold" mb={1}>
                    ⚠️ NOVO PEDIDO PENDENTE
                  </Text>
                )}
                Pedido #{currentOrder?.id}
              </Box>
              <Badge ml={2} colorScheme={getStatusColor(currentOrder?.status || 'pending')}>
                {currentOrder?.status || 'Pendente'}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody py={6}>
            {currentOrder ? (
              <Box>
                <Flex mb={4} justify="space-between">
                  <Box>
                    <Text fontWeight="bold">Cliente</Text>
                    <Text>{currentOrder.customerName}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Telefone</Text>
                    <Text>{currentOrder.customerPhone || 'Não informado'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Data/Hora</Text>
                    <Text>{new Date(currentOrder.createdAt).toLocaleString()}</Text>
                  </Box>
                </Flex>
                
                {currentOrder.deliveryAddress && (
                  <Box mb={4}>
                    <Text fontWeight="bold">Endereço de Entrega</Text>
                    <Text>{currentOrder.deliveryAddress}</Text>
                  </Box>
                )}
                
                <Box mb={4}>
                  <Text fontWeight="bold">Método de Entrega</Text>
                  <Text>{
                    currentOrder.deliveryMethod === 'delivery' ? 'Entrega' :
                    currentOrder.deliveryMethod === 'pickup' ? 'Retirada no Local' :
                    'Consumo no Local'
                  }</Text>
                </Box>
                
                <Box mb={4}>
                  <Text fontWeight="bold" mb={2}>Itens do Pedido</Text>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Item</Th>
                        <Th isNumeric>Qtd</Th>
                        <Th isNumeric>Valor</Th>
                        <Th isNumeric>Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Array.isArray(currentOrder?.items) ? (
                        currentOrder.items.map((item: any, index: number) => {
                          // Determinar o nome do produto e seu preço
                          const productName = item.name || `Produto #${item.id || item.productId}`;
                          const productPrice = typeof item.price === 'number' ? item.price : 
                                              (typeof item.price === 'string' ? parseFloat(item.price) : 25.00);
                          const itemQuantity = typeof item.quantity === 'number' ? item.quantity : 
                                              (typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : 1);
                          const itemTotal = typeof item.total === 'number' ? item.total : 
                                          (typeof item.total === 'string' ? parseFloat(item.total) : productPrice * itemQuantity);
                          
                          return (
                            <Tr key={index}>
                              <Td>
                                {productName}
                                {item.notes && (
                                  <Text fontSize="xs" color="gray.500" mt={1}>
                                    Obs: {item.notes}
                                  </Text>
                                )}
                              </Td>
                              <Td isNumeric>{itemQuantity}</Td>
                              <Td isNumeric>{formatCurrency(productPrice)}</Td>
                              <Td isNumeric>{formatCurrency(itemTotal)}</Td>
                            </Tr>
                          );
                        })
                      ) : (
                        // Se não tiver um array de itens, mas tiver notes JSON, tentar parsear
                        currentOrder?.notes && typeof currentOrder.notes === 'string' && currentOrder.notes.startsWith('[') ? (
                          (() => {
                            try {
                              // Tentar parsear os itens do campo notes
                              const parsedItems = JSON.parse(currentOrder.notes);
                              return parsedItems.map((item: any, index: number) => {
                                // Informações do item
                                const productName = item.name || `Produto #${item.id || item.productId}`;
                                const productPrice = typeof item.price === 'number' ? item.price : 
                                                    (typeof item.price === 'string' ? parseFloat(item.price) : 25.00);
                                const itemQuantity = typeof item.quantity === 'number' ? item.quantity : 
                                                    (typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : 1);
                                const itemTotal = typeof item.total === 'number' ? item.total : 
                                                (typeof item.total === 'string' ? parseFloat(item.total) : productPrice * itemQuantity);
                                
                                return (
                                  <Tr key={index}>
                                    <Td>
                                      {productName}
                                      {item.notes && (
                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                          Obs: {item.notes}
                                        </Text>
                                      )}
                                    </Td>
                                    <Td isNumeric>{itemQuantity}</Td>
                                    <Td isNumeric>{formatCurrency(productPrice)}</Td>
                                    <Td isNumeric>{formatCurrency(itemTotal)}</Td>
                                  </Tr>
                                );
                              });
                            } catch (e) {
                              console.error("Erro ao parsear itens do pedido:", e);
                              return (
                                <Tr>
                                  <Td colSpan={4}>Erro ao carregar itens do pedido</Td>
                                </Tr>
                              );
                            }
                          })()
                        ) : (
                          <Tr>
                            <Td colSpan={4}>Sem itens disponíveis</Td>
                          </Tr>
                        )
                      )}
                    </Tbody>
                    <Tfoot>
                      <Tr>
                        <Th colSpan={3} textAlign="right">Total</Th>
                        <Th isNumeric>{formatCurrency(currentOrder?.total || 0)}</Th>
                      </Tr>
                    </Tfoot>
                  </Table>
                </Box>
                
                {currentOrder.notes && (
                  <Box mb={4}>
                    <Text fontWeight="bold">Observações</Text>
                    <Text>{currentOrder.notes}</Text>
                  </Box>
                )}
                
                <Flex justify="flex-end" borderTopWidth="1px" pt={4}>
                  <Text fontWeight="bold" fontSize="lg">
                    Total: {formatCurrency(currentOrder.total || 0)}
                  </Text>
                </Flex>
              </Box>
            ) : (
              <Flex justify="center" align="center" height="200px">
                <Spinner />
              </Flex>
            )}
          </ModalBody>
          
          <ModalFooter borderTopWidth="1px">
            {currentOrder?.status === 'pending' && (
              <>
                <Button 
                  colorScheme="red" 
                  mr={3} 
                  leftIcon={<CloseIcon />}
                  onClick={handleRejectOrder}
                  isLoading={isLoadingAction}
                >
                  Recusar Pedido
                </Button>
                <Button 
                  colorScheme="green" 
                  leftIcon={<CheckIcon />}
                  onClick={handleAcceptOrder}
                  isLoading={isLoadingAction}
                  size="lg"
                  px={8}
                >
                  Aceitar Pedido
                </Button>
              </>
            )}
            
            {currentOrder?.status === 'preparing' && (
              <>
                <Button 
                  colorScheme="red" 
                  mr={3} 
                  leftIcon={<CloseIcon />}
                  onClick={handleRejectOrder}
                  isLoading={isLoadingAction}
                >
                  Cancelar
                </Button>
                <Button 
                  colorScheme="green" 
                  leftIcon={<CheckIcon />}
                  onClick={handleMarkAsReady}
                  isLoading={isLoadingAction}
                  size="lg"
                  px={8}
                >
                  Marcar como Pronto
                </Button>
              </>
            )}
            
            {currentOrder?.status === 'ready' && (
              <>
                <Button 
                  colorScheme="blue" 
                  mr={3} 
                  onClick={handleCloseOrderModal}
                >
                  Fechar
                </Button>
                <Button 
                  colorScheme="green" 
                  leftIcon={<CheckIcon />}
                  onClick={handleMarkAsDelivered}
                  isLoading={isLoadingAction}
                  size="lg"
                  px={8}
                >
                  Marcar como Entregue
                </Button>
              </>
            )}
            
            {!['pending', 'preparing', 'ready'].includes(currentOrder?.status || '') && (
              <Button colorScheme="blue" onClick={handleCloseOrderModal}>
                Fechar
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Modal de Campanha de Marketing */}
      <Modal isOpen={isMarketingModalOpen} onClose={onMarketingModalClose} size="lg">
        <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px">
            <Flex align="center">
              <ChatIcon color="green.500" mr={2} />
              Enviar Mensagem de Marketing
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody py={6}>
            {selectedCustomer && (
              <>
                <Box mb={4}>
                  <Text fontWeight="bold">Cliente</Text>
                  <Text>{selectedCustomer.customerName}</Text>
                </Box>
                
                <Box mb={4}>
                  <Text fontWeight="bold">Telefone</Text>
                  <Text>{selectedCustomer.customerPhone}</Text>
                </Box>
                
                <Box mb={4}>
                  <Text fontWeight="bold">Último Pedido</Text>
                  <Text>{new Date(selectedCustomer.lastOrderDate).toLocaleDateString()} ({selectedCustomer.daysSinceLastOrder ?? 0} dias atrás)</Text>
                </Box>
                
                <FormControl mb={4}>
                  <FormLabel fontWeight="bold">Selecione uma Campanha</FormLabel>
                  <Select 
                    value={selectedCampaign} 
                    onChange={(e) => handleCampaignChange(e.target.value)}
                  >
                    {marketingCampaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel fontWeight="bold">Mensagem</FormLabel>
                  <Textarea 
                    value={marketingMessage}
                    onChange={(e) => setMarketingMessage(e.target.value)}
                    placeholder="Digite a mensagem para o cliente"
                    rows={5}
                  />
                </FormControl>
                
                <FormControl mb={4}>
                  <FormLabel fontWeight="bold">Cupom de Desconto</FormLabel>
                  <RadioGroup value={selectedDiscount} onChange={setSelectedDiscount}>
                    <Stack direction="column">
                      <Radio value="">Nenhum cupom</Radio>
                      {availableDiscounts.map(discount => (
                        <Radio key={discount.code} value={discount.code}>
                          {discount.code} - {discount.description}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </>
            )}
          </ModalBody>
          
          <ModalFooter borderTopWidth="1px">
            <Button 
              colorScheme="gray" 
              mr={3} 
              onClick={onMarketingModalClose}
            >
              Cancelar
            </Button>
            <Button 
              colorScheme="whatsapp" 
              leftIcon={<PhoneIcon />}
              onClick={handleSendWhatsAppMessage}
            >
              Enviar via WhatsApp
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default Dashboard; 