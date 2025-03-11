import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Stack,
  Icon,
  chakra,
  useColorModeValue,
  Input,
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  useToast,
  FormErrorMessage,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FaWhatsapp, FaRocket, FaChartLine, FaMobileAlt, FaUsers, FaCreditCard, FaArrowRight, FaEnvelope, FaKey } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { api } from '../../services/api';

// Componentes animados com framer-motion
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);

// Interface para os dados de acesso
interface AccessInfo {
  email: string;
  password: string;
  message: string;
}

// Interface para a resposta da API
interface RegisterResponse {
  success: boolean;
  message: string;
  restaurant: {
    id: string;
    name: string;
    whatsappPending?: boolean;
    whatsappInstance?: string | null;
  };
  user: {
    id: string;
    email: string;
    tempPassword: string;
  };
  accessInfo: AccessInfo;
}

const LandingPage: React.FC = () => {
  const [formStep, setFormStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    city: '',
    state: '',
    whatsappNumber: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const primaryColor = useColorModeValue('teal.500', 'teal.300');
  const secondaryBg = useColorModeValue('gray.50', 'gray.700');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpar erro ao digitar
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateStep = () => {
    const errors: Record<string, string> = {};
    
    if (formStep === 0) {
      if (!formData.name) errors.name = 'Nome é obrigatório';
      if (!formData.email) errors.email = 'Email é obrigatório';
      if (!formData.phone) errors.phone = 'Telefone é obrigatório';
    } else if (formStep === 1) {
      if (!formData.businessName) errors.businessName = 'Nome do estabelecimento é obrigatório';
      if (!formData.businessType) errors.businessType = 'Tipo de negócio é obrigatório';
      if (!formData.city) errors.city = 'Cidade é obrigatória';
      if (!formData.state) errors.state = 'Estado é obrigatório';
      if (!formData.whatsappNumber) errors.whatsappNumber = 'Número do WhatsApp é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setFormStep(formStep + 1);
    }
  };

  const previousStep = () => {
    setFormStep(formStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    setLoading(true);
    
    try {
      console.log('Enviando dados para cadastro:', formData);
      
      // Enviar dados para API
      const response = await api.post<RegisterResponse>('/register-restaurant', formData);
      console.log('Resposta do servidor:', response.data);
      
      // Verificar se há informações de acesso na resposta
      if (response.data.accessInfo) {
        setAccessInfo(response.data.accessInfo);
        onOpen(); // Abrir modal com dados de acesso
      } else {
        // Sucesso sem dados de acesso (fallback)
        toast({
          title: 'Cadastro realizado!',
          description: 'Entraremos em contato em breve para concluir seu cadastro.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Resetar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        businessType: '',
        city: '',
        state: '',
        whatsappNumber: ''
      });
      
      setFormStep(0);
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      
      // Detalhando o erro
      if (error.response) {
        console.error('Detalhes do erro do servidor:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      toast({
        title: 'Erro no cadastro',
        description: 'Não foi possível completar seu cadastro. Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função alternativa para cadastro sem WhatsApp
  const handleSubmitNoWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    setLoading(true);
    
    try {
      console.log('Enviando dados para cadastro sem WhatsApp:', formData);
      
      // Enviar dados para API alternativa
      const response = await api.post<RegisterResponse>('/register-restaurant-no-whatsapp', formData);
      console.log('Resposta do servidor (sem WhatsApp):', response.data);
      
      // Verificar se há informações de acesso na resposta
      if (response.data.accessInfo) {
        setAccessInfo(response.data.accessInfo);
        onOpen(); // Abrir modal com dados de acesso
      } else {
        // Sucesso sem dados de acesso (fallback)
        toast({
          title: 'Cadastro realizado!',
          description: 'Entraremos em contato em breve para configurar seu WhatsApp.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Resetar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        businessType: '',
        city: '',
        state: '',
        whatsappNumber: ''
      });
      
      setFormStep(0);
    } catch (error: any) {
      console.error('Erro ao cadastrar sem WhatsApp:', error);
      
      // Detalhando o erro
      if (error.response) {
        console.error('Detalhes do erro do servidor (sem WhatsApp):', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }
      
      toast({
        title: 'Erro no cadastro',
        description: 'Não foi possível completar seu cadastro sem WhatsApp. Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com o fechamento da modal
  const handleCloseModal = () => {
    onClose();
    // Exibir toast após fechar a modal
    toast({
      title: 'Cadastro realizado com sucesso!',
      description: 'Os dados de acesso foram enviados para seu e-mail.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const features = [
    {
      icon: FaRocket,
      title: 'Aumento nas Vendas',
      description: 'Aumente seu faturamento em até 30% com nosso sistema integrado de pedidos online.'
    },
    {
      icon: FaMobileAlt,
      title: 'Cardápio Digital',
      description: 'Cardápio digital personalizado com fotos e descrições detalhadas dos produtos.'
    },
    {
      icon: FaWhatsapp,
      title: 'Integração com WhatsApp',
      description: 'Notificações automáticas para seus clientes sobre o status do pedido via WhatsApp.'
    },
    {
      icon: FaChartLine,
      title: 'Dashboard Inteligente',
      description: 'Acompanhe vendas, produtos mais populares e desempenho do seu negócio em tempo real.'
    },
    {
      icon: FaUsers,
      title: 'Gestão de Clientes',
      description: 'Banco de dados completo de clientes para ações de marketing direcionadas.'
    },
    {
      icon: FaCreditCard,
      title: 'Pagamentos Online',
      description: 'Aceite pagamentos online com integração com as principais plataformas de pagamento.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Básico',
      price: 'R$ 99/mês',
      features: [
        'Cardápio digital',
        'Pedidos ilimitados',
        'Gestão de pedidos',
        'Integração com WhatsApp',
        'Dashboard básico'
      ],
      recommended: false,
      color: 'blue'
    },
    {
      name: 'Padrão',
      price: 'R$ 149/mês',
      features: [
        'Tudo do plano Básico',
        'Sistema de fidelidade',
        'Marketing por WhatsApp',
        'Dashboard avançado',
        'Suporte prioritário'
      ],
      recommended: true,
      color: 'teal'
    },
    {
      name: 'Premium',
      price: 'R$ 249/mês',
      features: [
        'Tudo do plano Padrão',
        'Integração com iFood',
        'App personalizado',
        'Relatórios avançados',
        'Suporte 24/7'
      ],
      recommended: false,
      color: 'purple'
    }
  ];

  const testimonials = [
    {
      name: 'João Silva',
      business: 'Pizzaria Napoli',
      text: 'Desde que adotamos o AtendeJá, nossas vendas aumentaram em 35%. A facilidade de gerenciar pedidos e a integração com WhatsApp fizeram toda a diferença.',
      image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80'
    },
    {
      name: 'Maria Oliveira',
      business: 'Restaurante Sabor Caseiro',
      text: 'O sistema é muito intuitivo e me ajuda a gerenciar meu restaurante com facilidade. O suporte técnico é excelente!',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=922&q=80'
    },
    {
      name: 'Carlos Mendes',
      business: 'Hamburgueria Prime',
      text: 'A integração com WhatsApp revolucionou nossa comunicação com os clientes. Reduziu em 80% as ligações para saber o status do pedido.',
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        as="header"
        bg={primaryColor}
        color="white"
        py={4}
        position="sticky"
        top={0}
        zIndex={999}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="lg" fontWeight="bold">
              AtendeJá
            </Heading>
            <HStack spacing={6}>
              <Text as="a" href="#features" fontWeight="medium">Recursos</Text>
              <Text as="a" href="#pricing" fontWeight="medium">Planos</Text>
              <Text as="a" href="#testimonials" fontWeight="medium">Depoimentos</Text>
              <Button 
                as="a" 
                href="#register" 
                colorScheme="whiteAlpha"
                rightIcon={<FaArrowRight />}
              >
                Experimente Grátis
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        as="section" 
        py={20} 
        bg="linear-gradient(to right, #2C5282, #2B6CB0)"
        color="white"
      >
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', lg: 'row' }} align="center">
            <MotionBox 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
              w={{ base: 'full', lg: '50%' }}
              pr={{ base: 0, lg: 10 }}
              mb={{ base: 10, lg: 0 }}
            >
              <Heading 
                as="h1" 
                size="3xl" 
                fontWeight="bold"
                lineHeight="shorter"
                mb={6}
              >
                Transforme seu restaurante com tecnologia de ponta
              </Heading>
              <MotionText
                fontSize="xl"
                mb={8}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Aumente suas vendas, fidelize clientes e simplifique a gestão do seu negócio com o AtendeJá, a plataforma completa para delivery e restaurantes.
              </MotionText>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <Button 
                  as="a"
                  href="#register"
                  size="lg"
                  colorScheme="green"
                  rightIcon={<FaWhatsapp />}
                  _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
                  transition="all 0.3s"
                >
                  Comece Agora
                </Button>
                <Button 
                  as="a"
                  href="#features"
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  Conheça os Recursos
                </Button>
              </Stack>
            </MotionBox>
            <MotionBox 
              w={{ base: 'full', lg: '50%' }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Box
                boxShadow="2xl"
                borderRadius="2xl"
                overflow="hidden"
                transform={{ base: 'none', lg: 'rotate(3deg)' }}
              >
                <Image 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80" 
                  alt="Restaurante usando AtendeJá"
                  width="100%"
                />
              </Box>
            </MotionBox>
          </Flex>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        bg="white"
        py={12}
        boxShadow="md"
        position="relative"
        zIndex={2}
      >
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <MotionBox
              textAlign="center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Heading color="teal.500" fontSize="5xl" fontWeight="bold">+30%</Heading>
              <Text fontSize="xl" fontWeight="medium" mt={2}>Aumento médio em vendas</Text>
            </MotionBox>
            <MotionBox
              textAlign="center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Heading color="teal.500" fontSize="5xl" fontWeight="bold">+1.500</Heading>
              <Text fontSize="xl" fontWeight="medium" mt={2}>Restaurantes parceiros</Text>
            </MotionBox>
            <MotionBox
              textAlign="center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Heading color="teal.500" fontSize="5xl" fontWeight="bold">+500K</Heading>
              <Text fontSize="xl" fontWeight="medium" mt={2}>Pedidos processados</Text>
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" as="section" py={20} bg={secondaryBg}>
        <Container maxW="container.xl">
          <Box textAlign="center" mb={16}>
            <chakra.span
              color={primaryColor}
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Recursos
            </chakra.span>
            <Heading as="h2" size="2xl" mt={2} mb={5}>
              Tudo o que você precisa em um só lugar
            </Heading>
            <Text fontSize="xl" maxW="3xl" mx="auto" color="gray.500">
              O AtendeJá oferece uma solução completa para seu restaurante ou serviço de delivery,
              com recursos pensados para simplificar sua operação e aumentar suas vendas.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            {features.map((feature, index) => (
              <MotionBox
                key={index}
                bg={bgColor}
                p={8}
                borderRadius="lg"
                boxShadow="md"
                _hover={{ transform: 'translateY(-10px)', shadow: 'xl' }}
                style={{ transition: 'all 0.3s' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
              >
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  color="white"
                  rounded="full"
                  bg={primaryColor}
                  mb={5}
                >
                  <Icon as={feature.icon} boxSize={6} />
                </Flex>
                <Text fontWeight="bold" fontSize="xl" mb={3}>
                  {feature.title}
                </Text>
                <Text color="gray.600">{feature.description}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" as="section" py={20} bg={bgColor}>
        <Container maxW="container.xl">
          <Box textAlign="center" mb={16}>
            <chakra.span
              color={primaryColor}
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Planos
            </chakra.span>
            <Heading as="h2" size="2xl" mt={2} mb={5}>
              Escolha o plano ideal para o seu negócio
            </Heading>
            <Text fontSize="xl" maxW="3xl" mx="auto" color="gray.500">
              Temos opções para todos os tamanhos de negócio, desde pequenos restaurantes até grandes redes.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, lg: 10 }} alignItems="center">
            {pricingPlans.map((plan, index) => (
              <MotionBox
                key={index}
                bg={plan.recommended ? `${plan.color}.50` : bgColor}
                p={8}
                borderRadius="lg"
                borderWidth={plan.recommended ? "2px" : "1px"}
                borderColor={plan.recommended ? `${plan.color}.400` : "gray.200"}
                boxShadow={plan.recommended ? "xl" : "md"}
                position="relative"
                zIndex={plan.recommended ? 1 : 0}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                transform={plan.recommended ? { base: 'none', md: 'scale(1.05)' } : 'none'}
              >
                {plan.recommended && (
                  <Box
                    position="absolute"
                    top="-16px"
                    insetX="0"
                    textAlign="center"
                    textTransform="uppercase"
                    fontWeight="bold"
                    fontSize="sm"
                    color={`${plan.color}.600`}
                    letterSpacing="wider"
                  >
                    <Box
                      bg={`${plan.color}.100`}
                      color={`${plan.color}.700`}
                      py={1}
                      px={3}
                      rounded="full"
                      boxShadow="md"
                      display="inline-block"
                    >
                      Mais Popular
                    </Box>
                  </Box>
                )}
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color={plan.recommended ? `${plan.color}.500` : 'gray.800'}
                >
                  {plan.name}
                </Text>
                <Heading as="h3" fontSize="5xl" mt={4} mb={6}>
                  {plan.price}
                </Heading>
                <VStack align="start" spacing={4} mb={8}>
                  {plan.features.map((feature, featureIndex) => (
                    <HStack key={featureIndex}>
                      <Box color={`${plan.color}.500`}>
                        <svg width="20" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Box>
                      <Text>{feature}</Text>
                    </HStack>
                  ))}
                </VStack>
                <Button
                  as="a"
                  href="#register"
                  w="full"
                  colorScheme={plan.color}
                  variant={plan.recommended ? "solid" : "outline"}
                  size="lg"
                  fontWeight="bold"
                  py={6}
                >
                  Escolher Plano
                </Button>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box id="testimonials" as="section" py={20} bg={secondaryBg}>
        <Container maxW="container.xl">
          <Box textAlign="center" mb={16}>
            <chakra.span
              color={primaryColor}
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Depoimentos
            </chakra.span>
            <Heading as="h2" size="2xl" mt={2} mb={5}>
              O que nossos clientes dizem
            </Heading>
            <Text fontSize="xl" maxW="3xl" mx="auto" color="gray.500">
              Veja como o AtendeJá tem transformado negócios por todo o Brasil.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {testimonials.map((testimonial, index) => (
              <MotionBox
                key={index}
                bg={bgColor}
                p={8}
                borderRadius="lg"
                boxShadow="md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
              >
                <Flex direction="column" height="full">
                  <Text fontSize="lg" fontStyle="italic" mb={6} flex="1">
                    "{testimonial.text}"
                  </Text>
                  <Flex align="center">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      boxSize="60px"
                      borderRadius="full"
                      mr={4}
                    />
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">{testimonial.name}</Text>
                      <Text color="gray.600">{testimonial.business}</Text>
                    </Box>
                  </Flex>
                </Flex>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Registration Form Section */}
      <Box id="register" as="section" py={20} bg="linear-gradient(to right, #319795, #3182CE)">
        <Container maxW="container.lg">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
            <Box color="white">
              <Heading as="h2" size="2xl" mb={6}>
                Comece agora mesmo
              </Heading>
              <Text fontSize="xl" mb={8}>
                Preencha o formulário ao lado e comece sua jornada para transformar seu restaurante com o AtendeJá.
              </Text>
              <VStack align="start" spacing={6}>
                <HStack>
                  <Icon as={FaRocket} boxSize={6} />
                  <Text fontSize="lg">Implementação rápida em até 24h</Text>
                </HStack>
                <HStack>
                  <Icon as={FaUsers} boxSize={6} />
                  <Text fontSize="lg">Suporte técnico dedicado</Text>
                </HStack>
                <HStack>
                  <Icon as={FaWhatsapp} boxSize={6} />
                  <Text fontSize="lg">Integração WhatsApp gratuita</Text>
                </HStack>
                <HStack>
                  <Icon as={FaMobileAlt} boxSize={6} />
                  <Text fontSize="lg">Aplicativo personalizado</Text>
                </HStack>
              </VStack>
            </Box>
            <Box
              bg="white"
              borderRadius="xl"
              p={{ base: 6, md: 8 }}
              boxShadow="xl"
            >
              <form onSubmit={handleSubmit}>
                {formStep === 0 ? (
                  <VStack spacing={6}>
                    <Heading as="h3" size="lg" textAlign="center" mb={2}>
                      Seus dados
                    </Heading>
                    <FormControl isRequired isInvalid={!!formErrors.name}>
                      <FormLabel>Nome</FormLabel>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                      />
                      {formErrors.name && (
                        <FormErrorMessage>{formErrors.name}</FormErrorMessage>
                      )}
                    </FormControl>
                    
                    <FormControl isRequired isInvalid={!!formErrors.email}>
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                      />
                      {formErrors.email && (
                        <FormErrorMessage>{formErrors.email}</FormErrorMessage>
                      )}
                    </FormControl>
                    
                    <FormControl isRequired isInvalid={!!formErrors.phone}>
                      <FormLabel>Telefone</FormLabel>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                      />
                      {formErrors.phone && (
                        <FormErrorMessage>{formErrors.phone}</FormErrorMessage>
                      )}
                    </FormControl>
                    
                    <Button
                      colorScheme="teal"
                      size="lg"
                      width="full"
                      mt={4}
                      onClick={nextStep}
                    >
                      Continuar
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={6}>
                    <Heading as="h3" size="lg" textAlign="center" mb={2}>
                      Dados do estabelecimento
                    </Heading>
                    <FormControl isRequired isInvalid={!!formErrors.businessName}>
                      <FormLabel>Nome do estabelecimento</FormLabel>
                      <Input
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="Nome do seu restaurante"
                      />
                      {formErrors.businessName && (
                        <FormErrorMessage>{formErrors.businessName}</FormErrorMessage>
                      )}
                    </FormControl>
                    
                    <FormControl isRequired isInvalid={!!formErrors.businessType}>
                      <FormLabel>Tipo de negócio</FormLabel>
                      <Select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        placeholder="Selecione o tipo"
                      >
                        <option value="restaurant">Restaurante</option>
                        <option value="pizzeria">Pizzaria</option>
                        <option value="fastfood">Fast Food</option>
                        <option value="cafe">Café</option>
                        <option value="other">Outro</option>
                      </Select>
                      {formErrors.businessType && (
                        <FormErrorMessage>{formErrors.businessType}</FormErrorMessage>
                      )}
                    </FormControl>
                    
                    <SimpleGrid columns={2} spacing={4} width="full">
                      <FormControl isRequired isInvalid={!!formErrors.city}>
                        <FormLabel>Cidade</FormLabel>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Sua cidade"
                        />
                        {formErrors.city && (
                          <FormErrorMessage>{formErrors.city}</FormErrorMessage>
                        )}
                      </FormControl>
                      
                      <FormControl isRequired isInvalid={!!formErrors.state}>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="UF"
                        >
                          {[
                            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
                            'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
                            'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
                          ].map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </Select>
                        {formErrors.state && (
                          <FormErrorMessage>{formErrors.state}</FormErrorMessage>
                        )}
                      </FormControl>
                    </SimpleGrid>
                    
                    <FormControl isRequired isInvalid={!!formErrors.whatsappNumber}>
                      <FormLabel>WhatsApp do estabelecimento</FormLabel>
                      <Input
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                      />
                      {formErrors.whatsappNumber && (
                        <FormErrorMessage>{formErrors.whatsappNumber}</FormErrorMessage>
                      )}
                    </FormControl>
                    
                    <HStack width="full" spacing={4}>
                      <Button
                        colorScheme="gray"
                        size="lg"
                        width="full"
                        onClick={previousStep}
                      >
                        Voltar
                      </Button>
                      <Button
                        colorScheme="teal"
                        size="lg"
                        width="full"
                        type="submit"
                        isLoading={loading}
                        loadingText="Enviando..."
                      >
                        Criar conta grátis
                      </Button>
                    </HStack>
                    
                    {/* Botão alternativo para cadastro sem WhatsApp */}
                    <Box width="full" mt={2}>
                      <Button
                        variant="outline"
                        colorScheme="orange"
                        size="md"
                        width="full"
                        onClick={handleSubmitNoWhatsApp}
                        isLoading={loading}
                        loadingText="Enviando..."
                      >
                        Cadastrar sem configurar WhatsApp agora
                      </Button>
                      <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
                        Use esta opção se estiver enfrentando problemas com a integração do WhatsApp.
                        Você poderá configurar o WhatsApp depois.
                      </Text>
                    </Box>
                  </VStack>
                )}
              </form>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box bg="gray.800" color="white" py={10}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <Box>
              <Heading as="h3" size="lg" mb={4}>
                AtendeJá
              </Heading>
              <Text color="gray.400" mb={4}>
                A solução completa para restaurantes e delivery.
              </Text>
              <HStack spacing={4}>
                <Button size="sm" colorScheme="facebook" rounded="full" />
                <Button size="sm" colorScheme="twitter" rounded="full" />
                <Button size="sm" colorScheme="instagram" rounded="full" />
                <Button size="sm" colorScheme="linkedin" rounded="full" />
              </HStack>
            </Box>
            
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold" mb={2}>Produto</Text>
              <Text as="a" href="#features" color="gray.400">Recursos</Text>
              <Text as="a" href="#pricing" color="gray.400">Planos</Text>
              <Text as="a" href="#" color="gray.400">Integrações</Text>
              <Text as="a" href="#" color="gray.400">API</Text>
            </VStack>
            
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold" mb={2}>Empresa</Text>
              <Text as="a" href="#" color="gray.400">Sobre nós</Text>
              <Text as="a" href="#" color="gray.400">Clientes</Text>
              <Text as="a" href="#" color="gray.400">Blog</Text>
              <Text as="a" href="#" color="gray.400">Carreira</Text>
            </VStack>
            
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold" mb={2}>Suporte</Text>
              <Text as="a" href="#" color="gray.400">Centro de Ajuda</Text>
              <Text as="a" href="#" color="gray.400">Contato</Text>
              <Text as="a" href="#" color="gray.400">Status</Text>
              <Text as="a" href="#" color="gray.400">Política de Privacidade</Text>
            </VStack>
          </SimpleGrid>
          
          <Divider my={8} borderColor="gray.700" />
          
          <Text textAlign="center" color="gray.500">
            © {new Date().getFullYear()} AtendeJá. Todos os direitos reservados.
          </Text>
        </Container>
      </Box>

      {/* Modal de dados de acesso */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg={primaryColor} color="white" borderTopRadius="md">
            Cadastro Realizado com Sucesso!
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {accessInfo && (
              <>
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Importante!</AlertTitle>
                    <AlertDescription>
                      {accessInfo.message}
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Heading size="sm" mb={2}>Seus dados de acesso:</Heading>
                    <HStack mb={2}>
                      <Icon as={FaEnvelope} color={primaryColor} />
                      <Text fontWeight="bold">E-mail:</Text>
                      <Code p={2} borderRadius="md">{accessInfo.email}</Code>
                    </HStack>
                    <HStack>
                      <Icon as={FaKey} color={primaryColor} />
                      <Text fontWeight="bold">Senha:</Text>
                      <Code p={2} borderRadius="md">{accessInfo.password}</Code>
                    </HStack>
                  </Box>
                  
                  <Divider />
                  
                  <Text>
                    Acesse nossa plataforma em:{' '}
                    <chakra.span color={primaryColor} fontWeight="bold">
                      https://app.atendeplus.com.br
                    </chakra.span>
                  </Text>
                </VStack>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleCloseModal}>
              Entendi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LandingPage; 