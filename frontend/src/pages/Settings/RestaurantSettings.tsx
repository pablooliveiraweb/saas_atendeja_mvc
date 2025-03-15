import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  VStack,
  SimpleGrid,
  Textarea,
  FormHelperText,
  Image,
  Flex,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  IconButton
} from '@chakra-ui/react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
console.log('API_URL em RestaurantSettings:', API_URL);

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  operatingHours?: string;
  logo?: string;
  coverImage?: string;
  evolutionApiInstanceName?: string;
  evolutionApiInstanceConnected?: boolean;
  evolutionApiInstanceToken?: string;
  themeColor?: string;
  [key: string]: any;
}

interface LogoUploadResponse {
  logoUrl: string;
}

interface CoverUploadResponse {
  coverUrl: string;
}

// Função para garantir que a URL da imagem tenha o caminho completo
const getFullImageUrl = (path: string | undefined): string | undefined => {
  console.log('getFullImageUrl - Recebido path:', path);
  
  if (!path) {
    console.log('getFullImageUrl - Path vazio ou indefinido');
    return undefined;
  }
  
  // Se já começa com http:// ou https://, já é uma URL completa
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('getFullImageUrl - Já é uma URL completa:', path);
    return path;
  }
  
  // Se começa com data:, é uma URL de dados (base64)
  if (path.startsWith('data:')) {
    console.log('getFullImageUrl - É uma URL de dados (base64)');
    return path;
  }
  
  // Garantir que o caminho comece com /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  console.log('getFullImageUrl - Path normalizado:', normalizedPath);
  
  // Verificar se o caminho é para uma imagem de capa (coverImage)
  if (normalizedPath.includes('cover')) {
    // Para caminhos de imagem de capa, garantir o formato correto
    console.log('getFullImageUrl - Detectada imagem de capa');
    
    // Tentativa 1: Verificar se o caminho já contém '/uploads/cover/'
    if (normalizedPath.includes('/uploads/cover/')) {
      const fullUrl = `${API_URL}${normalizedPath}`;
      console.log('getFullImageUrl - URL completa para capa (formato padrão):', fullUrl);
      return fullUrl;
    }
    
    // Tentativa 2: Se o caminho contém apenas '/uploads/', adicionar 'cover/'
    if (normalizedPath.includes('/uploads/') && !normalizedPath.includes('/uploads/cover/')) {
      const correctedPath = normalizedPath.replace('/uploads/', '/uploads/cover/');
      const fullUrl = `${API_URL}${correctedPath}`;
      console.log('getFullImageUrl - URL completa para capa (corrigido para incluir /cover/):', fullUrl);
      return fullUrl;
    }
  }
  
  // URL padrão
  const fullUrl = `${API_URL}${normalizedPath}`;
  console.log('getFullImageUrl - URL completa gerada:', fullUrl);
  return fullUrl;
};

// Função para tentar recuperar a imagem de capa usando diferentes estratégias
const tryResolveImagePath = (basePath: string | undefined, type: 'logo' | 'cover'): string | undefined => {
  console.log(`tryResolveImagePath - Tentativa para ${type}. Path base:`, basePath);
  
  if (!basePath) {
    console.log(`tryResolveImagePath - ${type}: Path base vazio`);
    return undefined;
  }
  
  // Estratégia 1: Usar o caminho diretamente
  const directUrl = getFullImageUrl(basePath);
  console.log(`tryResolveImagePath - ${type}: URL direta:`, directUrl);
  
  // Para imagens de capa, tentar estratégias adicionais
  if (type === 'cover') {
    // Estratégia 2: Verificar se o caminho deve incluir "cover" explicitamente
    if (!basePath.includes('cover')) {
      const possibleCoverPath = basePath.includes('/uploads/') 
        ? basePath.replace('/uploads/', '/uploads/cover/') 
        : `/uploads/cover/${basePath.replace(/^\//, '')}`;
      
      console.log(`tryResolveImagePath - cover: Path com "cover" explícito:`, possibleCoverPath);
      const coverUrl = getFullImageUrl(possibleCoverPath);
      console.log(`tryResolveImagePath - cover: URL com "cover" explícito:`, coverUrl);
      
      // Retornar tanto a URL direta quanto a possível URL com "cover"
      return directUrl || coverUrl || undefined;
    }
    
    // Estratégia 3: Tentar variações no formato do caminho
    const variations = [
      basePath,
      basePath.replace('/uploads/', '/uploads/cover/'),
      `/uploads/cover/${basePath.split('/').pop()}`,
      `/uploads/${basePath.split('/').pop()}`
    ];
    
    console.log(`tryResolveImagePath - cover: Tentando variações:`, variations);
    
    // Usar a primeira URL gerada que não seja nula
    for (const path of variations) {
      const url = getFullImageUrl(path);
      if (url) {
        console.log(`tryResolveImagePath - cover: Encontrada URL válida:`, url);
        return url;
      }
    }
  }
  
  // Converter null para undefined
  return directUrl || undefined;
};

// Componente SafeImage para garantir que as imagens sejam exibidas corretamente
const SafeImage = ({ src, alt, style, className, ...props }: { 
  src?: string, 
  alt: string, 
  style?: React.CSSProperties, 
  className?: string,
  [key: string]: any
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [imgError, setImgError] = useState(false);
  
  // Resetar estado quando o src mudar
  useEffect(() => {
    console.log(`SafeImage (${alt}) - Source atualizado:`, src);
    setImgSrc(src);
    setImgError(false);
  }, [src, alt]);
  
  // Tratador de erro que tenta converter a imagem para base64
  const handleSafeImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!imgError && src) {
      setImgError(true);
      console.error(`Erro ao carregar imagem ${alt}:`, e);
      console.error(`SafeImage (${alt}) - Detalhes da imagem:`, {
        src: src,
        naturalWidth: (e.target as HTMLImageElement).naturalWidth,
        naturalHeight: (e.target as HTMLImageElement).naturalHeight,
        complete: (e.target as HTMLImageElement).complete,
        currentSrc: (e.target as HTMLImageElement).currentSrc
      });
      
      // Tentar carregar a imagem como blob e convertê-la para base64
      console.log(`SafeImage (${alt}) - Tentando fetch com no-cors:`, src);
      fetch(src, { mode: 'no-cors' })
        .then(response => {
          console.log(`SafeImage (${alt}) - Resposta do fetch:`, response);
          return response.blob();
        })
        .then(blob => {
          console.log(`SafeImage (${alt}) - Blob obtido:`, blob);
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              console.log(`SafeImage (${alt}) - Imagem convertida para base64`);
              setImgSrc(reader.result);
            }
          };
          reader.readAsDataURL(blob);
        })
        .catch(fetchError => {
          console.error(`SafeImage (${alt}) - Não foi possível converter a imagem para base64:`, fetchError);
          // Tentar construir um URL alternativo
          if (src.includes('/uploads/')) {
            const alternativeUrl = src.replace('/uploads/', '/uploads/cover/');
            console.log(`SafeImage (${alt}) - Tentando URL alternativa:`, alternativeUrl);
            setImgSrc(alternativeUrl);
          }
        });
    }
  }, [src, alt, imgError]);
  
  if (!src) {
    console.log(`SafeImage (${alt}) - Sem URL de origem`);
    return null;
  }
  
  console.log(`SafeImage (${alt}) - Renderizando imagem com src:`, imgSrc);
  
  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      style={style} 
      className={className}
      onError={handleSafeImageError}
      {...props}
    />
  );
};

// Primeiro, vamos definir as interfaces para os horários de funcionamento
interface TimePeriod {
  open: string;
  close: string;
}

interface OperatingHour {
  day: string;
  periods: TimePeriod[];
  isOpen: boolean;
}

interface OperatingHours {
  monday: OperatingHour;
  tuesday: OperatingHour;
  wednesday: OperatingHour;
  thursday: OperatingHour;
  friday: OperatingHour;
  saturday: OperatingHour;
  sunday: OperatingHour;
}

// No componente RestaurantSettings, adicionamos um estado para gerenciar os horários de funcionamento
const defaultOperatingHours: OperatingHours = {
  monday: { day: 'Segunda-feira', periods: [{ open: '08:00', close: '18:00' }], isOpen: true },
  tuesday: { day: 'Terça-feira', periods: [{ open: '08:00', close: '18:00' }], isOpen: true },
  wednesday: { day: 'Quarta-feira', periods: [{ open: '08:00', close: '18:00' }], isOpen: true },
  thursday: { day: 'Quinta-feira', periods: [{ open: '08:00', close: '18:00' }], isOpen: true },
  friday: { day: 'Sexta-feira', periods: [{ open: '08:00', close: '18:00' }], isOpen: true },
  saturday: { day: 'Sábado', periods: [{ open: '10:00', close: '16:00' }], isOpen: true },
  sunday: { day: 'Domingo', periods: [{ open: '10:00', close: '16:00' }], isOpen: false },
};

const RestaurantSettings: React.FC = () => {
  const { restaurant: authRestaurant, updateRestaurant: updateAuthRestaurant } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(undefined);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const toast = useToast();
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(defaultOperatingHours);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const operatingHoursBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        
        // Usar o restaurante do contexto de autenticação se disponível
        if (authRestaurant && authRestaurant.id) {
          setRestaurant(authRestaurant);
          console.log('Restaurante do contexto de autenticação:', authRestaurant);
          console.log('Logo do restaurante:', authRestaurant.logo);
          console.log('Imagem de capa do restaurante:', authRestaurant.coverImage);
          
          if (authRestaurant.logo) {
            const logoUrl = getFullImageUrl(authRestaurant.logo);
            console.log('URL completa do logo:', logoUrl);
            setLogoPreview(logoUrl);
          }
          
          if (authRestaurant.coverImage) {
            const coverUrl = getFullImageUrl(authRestaurant.coverImage);
            console.log('URL completa da capa:', coverUrl);
            setCoverPreview(coverUrl);
          } else {
            console.log('Imagem de capa não encontrada no authRestaurant');
          }
          
          setIsLoading(false);
          return;
        }
        
        // Caso contrário, buscar o restaurante do usuário logado
        const response = await api.get<Restaurant>('/users/me/restaurant');
        if (response.data) {
          console.log('Dados do restaurante da API:', response.data);
          console.log('Logo do restaurante (API):', response.data.logo);
          console.log('Imagem de capa do restaurante (API):', response.data.coverImage);
          
          setRestaurant(response.data);
          
          if (response.data.logo) {
            const logoUrl = getFullImageUrl(response.data.logo);
            console.log('URL completa do logo (API):', logoUrl);
            setLogoPreview(logoUrl);
          }
          
          if (response.data.coverImage) {
            const coverUrl = getFullImageUrl(response.data.coverImage);
            console.log('URL completa da capa (API):', coverUrl);
            setCoverPreview(coverUrl);
          } else {
            console.log('Imagem de capa não encontrada na resposta da API');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do restaurante:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do restaurante.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, [toast, authRestaurant]);

  // Adicionar useEffect para carregar os horários existentes, caso existam
  useEffect(() => {
    if (restaurant?.operatingHours) {
      try {
        // Tentar analisar os horários como JSON
        let parsedHoursData: any = null;
        
        try {
          parsedHoursData = JSON.parse(restaurant.operatingHours);
        } catch (error) {
          console.error('Erro ao analisar horários de funcionamento:', error);
        }
        
        // Se os horários foram analisados com sucesso e têm o formato esperado
        if (parsedHoursData && 
            typeof parsedHoursData === 'object' && 
            parsedHoursData.monday && 
            parsedHoursData.tuesday) {
          console.log('Horários de funcionamento carregados do restaurante:', parsedHoursData);
          
          // Verificar e converter do formato antigo para o novo formato com periods
          const convertedHours: OperatingHours = {} as OperatingHours;
          
          Object.keys(parsedHoursData).forEach((day) => {
            const dayKey = day as keyof OperatingHours;
            const dayData = parsedHoursData[dayKey];
            
            // Verificar se já está no formato com periods
            if (dayData.periods && Array.isArray(dayData.periods)) {
              convertedHours[dayKey] = dayData as OperatingHour;
            } else {
              // Converter do formato antigo para o novo formato
              convertedHours[dayKey] = {
                day: dayData.day || defaultOperatingHours[dayKey].day,
                isOpen: typeof dayData.isOpen === 'boolean' ? dayData.isOpen : true,
                periods: [
                  {
                    open: dayData.open || '08:00',
                    close: dayData.close || '18:00'
                  }
                ]
              };
            }
          });
          
          console.log('Horários convertidos:', convertedHours);
          setOperatingHours(convertedHours);
        } else {
          console.log('Formato de horários não reconhecido, usando padrão');
          setOperatingHours(defaultOperatingHours);
        }
      } catch (error) {
        console.error('Erro ao processar horários de funcionamento:', error);
        setOperatingHours(defaultOperatingHours);
      }
    }
  }, [restaurant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (restaurant) {
      setRestaurant({
        ...restaurant,
        [name]: value
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Adicionar função para manipular alterações nos horários
  const handleOperatingHourChange = (
    day: keyof OperatingHours, 
    field: keyof OperatingHour | 'periods', 
    value: any,
    periodIndex?: number
  ) => {
    if (field === 'periods' && periodIndex !== undefined) {
      // Edição de um período específico
      const { key, val } = value; // key pode ser 'open' ou 'close', val é o valor do horário
      
      setOperatingHours(prev => {
        const updatedPeriods = [...prev[day].periods];
        updatedPeriods[periodIndex] = {
          ...updatedPeriods[periodIndex],
          [key]: val
        };
        
        return {
          ...prev,
          [day]: {
            ...prev[day],
            periods: updatedPeriods
          }
        };
      });
    } else {
      // Edição direta de isOpen ou outro campo
      setOperatingHours(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [field]: value
        }
      }));
    }
  };
  
  // Adicionar função para adicionar novo período
  const addPeriod = (day: keyof OperatingHours) => {
    setOperatingHours(prev => {
      const updatedPeriods = [...prev[day].periods, { open: '12:00', close: '18:00' }];
      return {
        ...prev,
        [day]: {
          ...prev[day],
          periods: updatedPeriods
        }
      };
    });
  };
  
  // Adicionar função para remover período
  const removePeriod = (day: keyof OperatingHours, indexToRemove: number) => {
    setOperatingHours(prev => {
      // Se for o último período, não remover, apenas deixar vazio
      if (prev[day].periods.length <= 1) {
        return {
          ...prev,
          [day]: {
            ...prev[day],
            periods: [{ open: '08:00', close: '18:00' }]
          }
        };
      }
      
      // Caso contrário, remover o período
      const updatedPeriods = prev[day].periods.filter((_, index) => index !== indexToRemove);
      return {
        ...prev,
        [day]: {
          ...prev[day],
          periods: updatedPeriods
        }
      };
    });
  };

  // Adicionar função para gerar string formatada dos horários de funcionamento
  const formatOperatingHoursForDisplay = (): string => {
    const days = Object.keys(operatingHours) as Array<keyof OperatingHours>;
    
    return days
      .filter(day => operatingHours[day].isOpen)
      .map(day => {
        const { day: dayName, periods } = operatingHours[day];
        const periodsText = periods.map(period => `${period.open} às ${period.close}`).join(', ');
        return `${dayName}: ${periodsText}`;
      })
      .join('; ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant) return;
    
    try {
      setIsSaving(true);
      console.log('Iniciando atualização do restaurante...');
      
      // Converter os horários de funcionamento para JSON antes de enviar
      const operatingHoursJson = JSON.stringify(operatingHours);
      console.log('Horários de funcionamento a serem enviados:', operatingHoursJson);
      
      // Primeiro, atualizar os dados básicos do restaurante
      const response = await api.patch<Restaurant>(`/users/me/restaurant`, {
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        operatingHours: operatingHoursJson,
        themeColor: restaurant.themeColor
      });
      
      console.log('Resposta da atualização básica:', response.data);
      let updatedRestaurant: Restaurant = response.data;
      
      // Se houver arquivos para upload, enviar em requisições separadas
      if (logoFile) {
        console.log('Enviando logo para upload...');
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        
        const logoResponse = await api.post<LogoUploadResponse>(`/users/me/restaurant/upload/logo`, logoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Resposta do upload do logo:', logoResponse.data);
        
        if (logoResponse.data && logoResponse.data.logoUrl) {
          // Garantir que a URL do logo tenha o caminho completo
          const fullLogoUrl = getFullImageUrl(logoResponse.data.logoUrl);
          console.log('URL completa do logo após upload:', fullLogoUrl);
          
          updatedRestaurant = { 
            ...updatedRestaurant, 
            logo: logoResponse.data.logoUrl, // Mantemos o caminho relativo no objeto
            logoFullUrl: fullLogoUrl // Adicionamos o caminho completo para exibição
          };
        }
      }
      
      if (coverFile) {
        console.log('Enviando imagem de capa para upload...');
        const coverFormData = new FormData();
        coverFormData.append('cover', coverFile);
        
        const coverResponse = await api.post<CoverUploadResponse>(`/users/me/restaurant/upload/cover`, coverFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Resposta do upload da capa:', coverResponse.data);
        
        if (coverResponse.data && coverResponse.data.coverUrl) {
          // Garantir que a URL da capa tenha o caminho completo
          const fullCoverUrl = getFullImageUrl(coverResponse.data.coverUrl);
          console.log('URL completa da capa após upload:', fullCoverUrl);
          
          updatedRestaurant = { 
            ...updatedRestaurant, 
            coverImage: coverResponse.data.coverUrl, // Mantemos o caminho relativo no objeto
            coverImageFullUrl: fullCoverUrl // Adicionamos o caminho completo para exibição
          };
        }
      }
      
      console.log('Restaurante atualizado:', updatedRestaurant);
      console.log('Logo final:', updatedRestaurant.logo);
      console.log('Imagem de capa final:', updatedRestaurant.coverImage);
      
      // Atualizar o estado local e o contexto de autenticação
      setRestaurant(updatedRestaurant);
      if (updateAuthRestaurant) {
        updateAuthRestaurant(updatedRestaurant);
      }
      
      // Atualizar os previews com as URLs completas
      if (updatedRestaurant.logo) {
        const logoPreviewUrl = getFullImageUrl(updatedRestaurant.logo);
        console.log('Preview do logo atualizado:', logoPreviewUrl);
        setLogoPreview(logoPreviewUrl);
      }
      
      if (updatedRestaurant.coverImage) {
        const coverPreviewUrl = getFullImageUrl(updatedRestaurant.coverImage);
        console.log('Preview da capa atualizado:', coverPreviewUrl);
        setCoverPreview(coverPreviewUrl);
      } else {
        console.log('Não foi possível atualizar o preview da capa - capa ausente no objeto restaurante');
      }
      
      toast({
        title: 'Sucesso',
        description: 'Dados do restaurante atualizados com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao atualizar dados do restaurante:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os dados do restaurante.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={4}>Configurações do Restaurante</Heading>
        <Divider mb={6} />
        <Text>Carregando dados do restaurante...</Text>
      </Box>
    );
  }

  if (!restaurant) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={4}>Configurações do Restaurante</Heading>
        <Divider mb={6} />
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <AlertTitle>Restaurante não encontrado</AlertTitle>
            <AlertDescription>
              Não foi possível encontrar o restaurante associado ao seu usuário. Por favor, verifique se você está logado corretamente.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>Configurações do Restaurante</Heading>
      <Divider mb={6} />

      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box bg={bgColor} p={6} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <Heading size="md" mb={4}>Informações Básicas</Heading>
              
              <VStack spacing={4} align="stretch">
                <FormControl id="name" isRequired>
                  <FormLabel>Nome do Restaurante</FormLabel>
                  <Input 
                    name="name" 
                    value={restaurant.name || ''} 
                    onChange={handleInputChange} 
                  />
                </FormControl>
                
                <FormControl id="description">
                  <FormLabel>Descrição</FormLabel>
                  <Textarea 
                    name="description" 
                    value={restaurant.description || ''} 
                    onChange={handleInputChange}
                    rows={3}
                  />
                  <FormHelperText>Uma breve descrição do seu restaurante</FormHelperText>
                </FormControl>
                
                <FormControl id="address">
                  <FormLabel>Endereço</FormLabel>
                  <Input 
                    name="address" 
                    value={restaurant.address || ''} 
                    onChange={handleInputChange} 
                  />
                </FormControl>
                
                <FormControl id="phone">
                  <FormLabel>Telefone</FormLabel>
                  <Input 
                    name="phone" 
                    value={restaurant.phone || ''} 
                    onChange={handleInputChange} 
                  />
                </FormControl>
                
                <FormControl id="operatingHours" mt={4}>
                  <FormLabel>Horários de Funcionamento</FormLabel>
                  <Box 
                    borderWidth="1px" 
                    borderRadius="md" 
                    p={4} 
                    bg={operatingHoursBgColor}
                    borderColor={borderColor}
                  >
                    <VStack spacing={4} align="stretch">
                      {Object.keys(operatingHours).map((day) => {
                        const dayKey = day as keyof OperatingHours;
                        const dayData = operatingHours[dayKey];
                        
                        return (
                          <Box key={day} mb={4}>
                            <Flex justify="space-between" align="center" mb={2}>
                              <Box width="40%">
                                <Flex align="center">
                                  <input 
                                    type="checkbox" 
                                    checked={dayData.isOpen} 
                                    onChange={(e) => handleOperatingHourChange(dayKey, 'isOpen', e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                  />
                                  <Text fontWeight={dayData.isOpen ? "medium" : "normal"} color={dayData.isOpen ? "black" : "gray.500"}>
                                    {dayData.day}
                                  </Text>
                                </Flex>
                              </Box>
                              
                              {dayData.isOpen && (
                                <Button 
                                  size="sm" 
                                  colorScheme="blue" 
                                  onClick={() => addPeriod(dayKey)}
                                  leftIcon={<Box as="span">+</Box>}
                                >
                                  Adicionar Período
                                </Button>
                              )}
                            </Flex>
                            
                            {dayData.isOpen && dayData.periods.map((period, periodIndex) => (
                              <Flex key={`${day}-${periodIndex}`} justify="space-between" align="center" ml={4} mb={2}>
                                <Text mr={2} fontWeight="medium" fontSize="sm">Período {periodIndex + 1}:</Text>
                                
                                <Flex flex="1" justify="flex-end" align="center">
                                  <Input 
                                    type="time" 
                                    value={period.open} 
                                    onChange={(e) => handleOperatingHourChange(
                                      dayKey, 
                                      'periods', 
                                      { key: 'open', val: e.target.value },
                                      periodIndex
                                    )}
                                    size="sm"
                                    width="120px"
                                    isDisabled={!dayData.isOpen}
                                    mr={2}
                                  />
                                  <Text mx={2} alignSelf="center" color={dayData.isOpen ? "black" : "gray.500"}>às</Text>
                                  <Input 
                                    type="time" 
                                    value={period.close} 
                                    onChange={(e) => handleOperatingHourChange(
                                      dayKey, 
                                      'periods', 
                                      { key: 'close', val: e.target.value },
                                      periodIndex
                                    )}
                                    size="sm"
                                    width="120px"
                                    isDisabled={!dayData.isOpen}
                                  />
                                  
                                  {dayData.periods.length > 1 && (
                                    <IconButton
                                      aria-label="Remover período"
                                      icon={<Box as="span">✕</Box>}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      ml={2}
                                      onClick={() => removePeriod(dayKey, periodIndex)}
                                    />
                                  )}
                                </Flex>
                              </Flex>
                            ))}
                          </Box>
                        );
                      })}
                    </VStack>
                    
                    <Box mt={4} p={3} bg="gray.50" borderRadius="md">
                      <Text fontSize="sm" fontWeight="medium">Visualização:</Text>
                      <Text fontSize="sm" mt={1}>{formatOperatingHoursForDisplay()}</Text>
                    </Box>
                    
                    <Text fontSize="xs" mt={2} color="gray.500">
                      Os horários de funcionamento serão usados para determinar se o restaurante está aberto ou fechado no menu digital.
                      Você pode adicionar múltiplos períodos para cada dia, como almoço e jantar.
                    </Text>
                  </Box>
                </FormControl>
              </VStack>
            </Box>
            
            <Box bg={bgColor} p={6} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <Heading size="md" mb={4}>Imagens</Heading>
              
              <VStack spacing={6} align="stretch">
                <FormControl id="logo">
                  <FormLabel>Logo do Restaurante</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    p={1}
                  />
                  <FormHelperText>Tamanho recomendado: 200x200 pixels</FormHelperText>
                  
                  {(logoPreview || (restaurant && restaurant.logo)) && (
                    <Flex mt={4} justify="center" direction="column" align="center">
                      <Box 
                        border="1px solid" 
                        borderColor="gray.200" 
                        borderRadius="md" 
                        p={2} 
                        bg="white"
                        maxW="200px"
                        maxH="200px"
                        overflow="hidden"
                      >
                        <SafeImage 
                          src={logoPreview || (restaurant?.logo ? `${API_URL}${restaurant.logo.startsWith('/') ? '' : '/'}${restaurant.logo}` : undefined)} 
                          alt="Logo Preview" 
                          style={{
                            maxHeight: "100px",
                            maxWidth: "100%",
                            objectFit: "contain"
                          }}
                        />
                      </Box>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        Logo atual do restaurante
                      </Text>
                    </Flex>
                  )}
                </FormControl>
                
                <FormControl id="coverImage">
                  <FormLabel>Imagem de Capa</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    p={1}
                  />
                  <FormHelperText>Tamanho recomendado: 1200x400 pixels</FormHelperText>
                  
                  {(coverPreview || (restaurant && restaurant.coverImage)) && (
                    <Flex mt={4} justify="center" direction="column" align="center">
                      <Box 
                        border="1px solid" 
                        borderColor="gray.200" 
                        borderRadius="md" 
                        p={2} 
                        bg="white"
                        maxW="100%"
                        overflow="hidden"
                      >
                        <SafeImage 
                          src={coverPreview || (restaurant?.coverImage ? `${API_URL}${restaurant.coverImage.startsWith('/') ? '' : '/'}${restaurant.coverImage}` : undefined)} 
                          alt="Cover Preview" 
                          style={{
                            maxHeight: "150px",
                            width: "100%",
                            objectFit: "cover",
                            borderRadius: "md"
                          }}
                        />
                      </Box>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        Imagem de capa atual do restaurante
                      </Text>
                    </Flex>
                  )}
                </FormControl>
              </VStack>
            </Box>
          </SimpleGrid>
          
          {/* Nova seção para personalização do menu digital */}
          <Box bg={bgColor} p={6} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
            <Heading size="md" mb={2}>Personalização do Menu Digital</Heading>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Personalize a aparência do cardápio digital do seu restaurante para combinar com a sua marca.
            </Text>
            
            <VStack spacing={6} align="stretch">
              <FormControl id="themeColor">
                <FormLabel>Cor do Tema</FormLabel>
                <Flex align="center">
                  <Input
                    type="color"
                    name="themeColor"
                    value={restaurant.themeColor || '#3182ce'}
                    onChange={handleInputChange}
                    w="80px"
                    h="40px"
                    p={1}
                    cursor="pointer"
                  />
                  <Input
                    name="themeColor"
                    value={restaurant.themeColor || '#3182ce'}
                    onChange={handleInputChange}
                    ml={3}
                    w="calc(100% - 80px)"
                    placeholder="Cor personalizada (ex: #3182ce)"
                  />
                </Flex>
                <FormHelperText>
                  Escolha uma cor personalizada para o cardápio digital do seu restaurante. Esta cor será aplicada aos botões, ícones e elementos destacados.
                </FormHelperText>
                
                {restaurant.themeColor && (
                  <Box mt={3} p={3} borderRadius="md" boxShadow="sm" borderWidth="1px">
                    <Text fontWeight="medium" mb={2}>Pré-visualização:</Text>
                    <Flex flexWrap="wrap" gap={2}>
                      <Box 
                        w="80px" 
                        h="30px" 
                        borderRadius="md" 
                        bg={restaurant.themeColor} 
                        boxShadow="sm"
                      />
                      <Box 
                        w="80px" 
                        h="30px" 
                        borderRadius="full" 
                        bg={restaurant.themeColor} 
                        boxShadow="sm"
                      />
                      <Button 
                        size="sm" 
                        bg={restaurant.themeColor} 
                        color="white" 
                        _hover={{ bg: `${restaurant.themeColor}e0` }}
                      >
                        Botão
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        borderColor={restaurant.themeColor} 
                        color={restaurant.themeColor}
                        _hover={{ bg: `${restaurant.themeColor}20` }}
                      >
                        Botão
                      </Button>
                    </Flex>
                  </Box>
                )}
              </FormControl>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Dica de personalização</AlertTitle>
                  <AlertDescription>
                    Escolha uma cor que combine com a identidade visual do seu restaurante. 
                    As alterações afetarão imediatamente a aparência do seu menu digital, 
                    tornando-o mais atraente e consistente com a sua marca.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </Box>

          <Flex justify="flex-end">
            <Button 
              type="submit" 
              colorScheme="blue" 
              isLoading={isSaving}
              loadingText="Salvando"
              size="lg"
            >
              Salvar Alterações
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
};

export default RestaurantSettings; 