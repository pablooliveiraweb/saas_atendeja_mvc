import React from 'react';
import { Box, Typography, Avatar, Container, Paper, Button } from '@mui/material';
import { RestaurantInfo } from '../services/menuService';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';

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
console.log('API_URL em MenuHeader:', API_URL);

// Função para garantir que a URL da imagem tenha o caminho completo
const getFullImageUrl = (path: string | undefined): string | undefined => {
  if (!path) return undefined;
  
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

interface MenuHeaderProps {
  restaurant: RestaurantInfo;
  isLoggedIn?: boolean;
  userName?: string;
}

// Adicionar esta interface para operatingHours
interface TimePeriod {
  open: string;
  close: string;
}

interface OperatingHourInfo {
  day?: string;
  periods: TimePeriod[];
  isOpen: boolean;
}

interface OperatingHoursType {
  [key: string]: OperatingHourInfo;
}

// Função para converter horários do formato antigo para o novo formato
const convertLegacyOperatingHours = (operatingHours: any): OperatingHoursType => {
  if (!operatingHours) return {} as OperatingHoursType;
  
  const convertedHours: OperatingHoursType = {} as OperatingHoursType;
  
  Object.keys(operatingHours).forEach((day) => {
    const dayData = operatingHours[day];
    
    // Verificar se já está no formato com periods
    if (dayData.periods && Array.isArray(dayData.periods)) {
      convertedHours[day] = dayData;
    } else {
      // Converter do formato antigo para o novo formato
      convertedHours[day] = {
        day: dayData.day,
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
  
  return convertedHours;
};

// Adicionar esta função para verificar se o restaurante está aberto no momento
const isRestaurantOpen = (operatingHoursString?: string): boolean => {
  if (!operatingHoursString) return false;
  
  try {
    // Tentar converter a string JSON para objeto
    let operatingHours: OperatingHoursType | null = null;
    try {
      const parsedHours = JSON.parse(operatingHoursString);
      // Verificar e converter do formato antigo se necessário
      operatingHours = convertLegacyOperatingHours(parsedHours);
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
    // Verificação adicional: se o objeto operatingHours for nulo, interromper
    if (!operatingHours) {
      console.log('operatingHours é nulo');
      return true; // Por padrão, consideramos aberto
    }
    
    const dayConfig = operatingHours[dayKey];
    
    // Se não houver configuração para o dia ou o isOpen for false, está fechado
    if (!dayConfig || dayConfig.isOpen === false) {
      console.log(`Restaurante fechado no ${dayKey}`);
      return false;
    }
    
    // Converter horário atual para minutos para facilitar comparação
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Verificar se o horário atual está dentro de algum dos períodos de funcionamento
    const isWithinAnyPeriod = dayConfig.periods && dayConfig.periods.some(period => {
      // Verificar se o período tem horários válidos
      if (!period.open || !period.close) return false;
      
      // Converter horários do período para minutos
      const openTime = period.open.split(':');
      const closeTime = period.close.split(':');
      
      const openHour = parseInt(openTime[0], 10);
      const openMinute = parseInt(openTime[1], 10);
      const closeHour = parseInt(closeTime[0], 10);
      const closeMinute = parseInt(closeTime[1], 10);
      
      const openTimeInMinutes = openHour * 60 + openMinute;
      const closeTimeInMinutes = closeHour * 60 + closeMinute;
      
      // Verificar se o horário atual está dentro deste período
      const isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
      
      console.log(`Verificação de período: atual: ${currentHour}:${currentMinute}, aberto: ${period.open}, fechado: ${period.close} => ${isOpen ? 'Aberto' : 'Fechado'}`);
      
      return isOpen;
    });
    
    console.log(`Restaurante está ${isWithinAnyPeriod ? 'aberto' : 'fechado'} em algum período`);
    
    return isWithinAnyPeriod;
  } catch (error) {
    console.error('Erro ao verificar horário de funcionamento:', error);
    return true; // Em caso de erro, consideramos aberto por padrão
  }
};

// Modificar a função para exibir apenas o horário de fechamento do período atual
const formatOperatingHours = (operatingHoursString?: string): string => {
  if (!operatingHoursString) return '';
  
  try {
    // Tentar converter a string JSON para objeto
    let operatingHours: OperatingHoursType | null = null;
    try {
      const parsedHours = JSON.parse(operatingHoursString);
      // Verificar e converter do formato antigo se necessário
      operatingHours = convertLegacyOperatingHours(parsedHours);
    } catch (error) {
      // Se não for JSON válido, retornar a string como está
      return operatingHoursString;
    }
    
    // Verificar o formato dos horários
    if (!operatingHours || typeof operatingHours !== 'object') {
      return operatingHoursString;
    }
    
    // Obter o dia da semana atual
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
    
    // Verificar se temos horários para hoje
    if (!operatingHours || !operatingHours[dayKey] || !operatingHours[dayKey].isOpen) {
      return 'Fechado hoje';
    }
    
    // Converter horário atual para minutos
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Procurar o período atual e apresentar a próxima hora de fechamento
    const periods = operatingHours[dayKey].periods || [];
    
    for (const period of periods) {
      // Converter horários do período para minutos
      const openTime = period.open.split(':');
      const closeTime = period.close.split(':');
      
      const openHour = parseInt(openTime[0], 10);
      const openMinute = parseInt(openTime[1], 10);
      const closeHour = parseInt(closeTime[0], 10);
      const closeMinute = parseInt(closeTime[1], 10);
      
      const openTimeInMinutes = openHour * 60 + openMinute;
      const closeTimeInMinutes = closeHour * 60 + closeMinute;
      
      // Se estamos dentro deste período, mostrar a hora de fechamento
      if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
        return `Aberto agora até ${period.close}`;
      }
      
      // Se ainda não abriu mas vai abrir mais tarde hoje
      if (currentTimeInMinutes < openTimeInMinutes) {
        return `Abre hoje às ${period.open}`;
      }
    }
    
    // Se chegamos aqui, está fechado no momento atual, verificar próximo período
    const nextPeriod = periods.find(period => {
      const openTime = period.open.split(':');
      const openHour = parseInt(openTime[0], 10);
      const openMinute = parseInt(openTime[1], 10);
      const openTimeInMinutes = openHour * 60 + openMinute;
      
      return currentTimeInMinutes < openTimeInMinutes;
    });
    
    if (nextPeriod) {
      return `Abre novamente às ${nextPeriod.open}`;
    }
    
    // Se não encontrou períodos futuros, está fechado pelo resto do dia
    return 'Fechado agora';
  } catch (error) {
    console.error('Erro ao formatar horários:', error);
    return operatingHoursString || '';
  }
};

const MenuHeader: React.FC<MenuHeaderProps> = ({ 
  restaurant, 
  isLoggedIn = false, 
  userName = '' 
}) => {
  console.log('MenuHeader - restaurant recebido:', restaurant);
  console.log('MenuHeader - coverImage:', restaurant.coverImage);
  console.log('MenuHeader - logo:', restaurant.logo);
  console.log('MenuHeader - openingHours:', restaurant.openingHours);

  // Garantir que as imagens tenham o caminho completo
  const coverImageUrl = restaurant.coverImage ? getFullImageUrl(restaurant.coverImage) : undefined;
  const logoUrl = restaurant.logo ? getFullImageUrl(restaurant.logo) : undefined;
  
  console.log('MenuHeader - coverImageUrl processada:', coverImageUrl);
  console.log('MenuHeader - logoUrl processada:', logoUrl);

  // Verificar se as URLs são válidas
  const isCoverImageValid = coverImageUrl && coverImageUrl.length > 0;
  const isLogoValid = logoUrl && logoUrl.length > 0;
  
  console.log('MenuHeader - isCoverImageValid:', isCoverImageValid);
  console.log('MenuHeader - isLogoValid:', isLogoValid);

  // Verificar se o restaurante está aberto ou fechado
  const isOpen = isRestaurantOpen(restaurant.openingHours);
  console.log('MenuHeader - isOpen:', isOpen);
  
  // Formatar os horários de funcionamento para exibição
  const formattedOpeningHours = formatOperatingHours(restaurant.openingHours);
  console.log('MenuHeader - formattedOpeningHours:', formattedOpeningHours);

  // Cor do tema para o restaurante (padrão azul)
  const themeColor = restaurant.themeColor || '#3182ce';
  console.log('MenuHeader - cor do tema:', themeColor);

  // Manipuladores de erro para ajudar na depuração
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, imageName: string) => {
    console.error(`Erro ao carregar a imagem ${imageName}:`, e);
    
    // Verificar detalhes específicos do erro
    const imgElement = e.target as HTMLImageElement;
    console.error(`Detalhes da imagem ${imageName}:`, {
      naturalWidth: imgElement.naturalWidth,
      naturalHeight: imgElement.naturalHeight,
      complete: imgElement.complete,
      currentSrc: imgElement.currentSrc,
      src: imgElement.src
    });
  };

  // Verificar possíveis problemas de CORS
  React.useEffect(() => {
    if (coverImageUrl) {
      console.log('Tentando pré-carregar imagem de capa:', coverImageUrl);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => console.log('Imagem de capa pré-carregada com sucesso');
      img.onerror = (error) => console.error('Erro ao pré-carregar imagem de capa:', error);
      img.src = coverImageUrl;
    }
    
    if (logoUrl) {
      console.log('Tentando pré-carregar logo:', logoUrl);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => console.log('Logo pré-carregado com sucesso');
      img.onerror = (error) => console.error('Erro ao pré-carregar logo:', error);
      img.src = logoUrl;
    }
  }, [coverImageUrl, logoUrl]);

  // Componente de imagem segura que tenta diferentes abordagens para carregar a imagem
  const SafeImage = ({ src, alt, style, className, ...props }: { 
    src?: string, 
    alt: string, 
    style?: React.CSSProperties, 
    className?: string,
    [key: string]: any
  }) => {
    const [imgSrc, setImgSrc] = React.useState<string | undefined>(src);
    const [imgError, setImgError] = React.useState(false);
    
    // Tratador de erro que tenta abordagens alternativas
    const handleImageError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!imgError && src) {
        setImgError(true);
        console.error(`Erro ao carregar imagem ${alt}:`, e);
        
        // Tentar URL alternativa sem o prefixo da API
        if (src.includes(API_URL)) {
          const alternativeSrc = src.replace(API_URL, '');
          console.log(`Tentando URL alternativa para ${alt}:`, alternativeSrc);
          setImgSrc(alternativeSrc);
          return;
        }
        
        // Tentar URL com origem diferente
        if (src.startsWith('/uploads/')) {
          const alternativeSrc = `${window.location.origin}${src}`;
          console.log(`Tentando URL com origem atual para ${alt}:`, alternativeSrc);
          setImgSrc(alternativeSrc);
        }
      }
    }, [src, alt, imgError]);
    
    if (!src) return null;
    
    return (
      <img 
        src={imgSrc} 
        alt={alt} 
        style={style} 
        className={className}
        onError={handleImageError}
        crossOrigin="anonymous"
        {...props}
      />
    );
  };

  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        mb: 4,
        bgcolor: 'white',
        color: '#333333',
      }}
    >      
      {/* Imagem de capa */}
      {coverImageUrl && (
        <div style={{ 
          position: 'relative', 
          height: '180px', 
          width: '100%', 
          overflow: 'hidden' 
        }}>
          {/* Imagem de fundo como SafeImage */}
          <SafeImage 
            src={coverImageUrl}
            alt="Capa do restaurante"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
          />
          
          {/* Overlay escuro mais claro para melhorar a visibilidade da imagem, usando cor personalizada */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: `rgba(0,0,0,0.3)`,
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))`,
              zIndex: 2
            }}
          />
        </div>
      )}
      
      {/* Seção única de conteúdo */}
      <Box
        sx={{
          width: '100%',
          position: 'relative',
          zIndex: 3,
          marginTop: coverImageUrl ? '-80px' : 0,
          boxShadow: 'none',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Informações principais do restaurante */}
        <Box
          sx={{
            width: '100%',
            background: coverImageUrl ? 'transparent' : 'white',
            color: coverImageUrl ? 'white' : '#333333',
            py: 3,
            pb: coverImageUrl ? 2 : 3,
            position: 'relative',
            zIndex: 5,
            borderBottom: 'none',
            boxShadow: 'none',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Informações do restaurante (lado esquerdo) */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textAlign: 'left'
          }}>
                {/* Logo do restaurante */}
                {logoUrl ? (
                  <div 
                    style={{
                      width: 80,
                      height: 80,
                      marginRight: 16,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid white',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      backgroundColor: '#f0f0f0',
                      position: 'relative',
                      zIndex: 10
                    }}
                  >
                    <SafeImage 
                      src={logoUrl}
                      alt={restaurant.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ) : (
            <Avatar
              alt={restaurant.name}
              sx={{
                      width: 80,
                      height: 80,
                mr: 2,
                      border: '3px solid white',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      bgcolor: themeColor, // Usar cor do tema
                      position: 'relative',
                      zIndex: 10
                    }}
                  >
                    {restaurant.name.charAt(0)}
                  </Avatar>
                )}
            
            <Box>
              <Typography 
                variant="h5" 
                component="h1" 
                fontWeight="bold" 
                sx={{ 
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                      color: coverImageUrl ? 'white' : '#333333',
                      textShadow: coverImageUrl ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                      position: 'relative',
                      zIndex: 5
                }}
              >
                {restaurant.name}
              </Typography>
              
              {restaurant.description && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                        color: coverImageUrl ? 'rgba(255,255,255,0.9)' : '#666666',
                    maxWidth: '400px',
                        mb: coverImageUrl ? 1 : 1,
                        textShadow: coverImageUrl ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                        position: 'relative',
                        zIndex: 5
                  }}
                >
                  {restaurant.description}
                </Typography>
              )}
              
                  {/* Mostrar informações de contato apenas quando não há imagem de capa */}
                  {!coverImageUrl && (
                    <Box 
                      sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 2,
                color: '#666666',
                        fontSize: '0.8rem',
                        '& svg': {
                          color: `${themeColor} !important`, // Usar cor do tema
                        },
                        '& p': {
                          color: '#666666 !important',
                          fontWeight: 'normal',
                        }
                      }}
                    >
                {restaurant.openingHours && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">
                            {formattedOpeningHours}
                    </Typography>
                          <Box 
                            component="span" 
                            sx={{ 
                              ml: 1, 
                              bgcolor: isOpen ? 'success.main' : 'error.main', 
                              color: 'white',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              px: 1,
                              py: 0.3,
                              borderRadius: '4px'
                            }}
                          >
                            {isOpen ? 'ABERTO' : 'FECHADO'}
                          </Box>
                  </Box>
                )}
                
                {restaurant.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon fontSize="small" />
                    <Typography variant="body2">
                      {restaurant.address}
                    </Typography>
                  </Box>
                )}
                
                {restaurant.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="small" />
                    <Typography variant="body2">
                      {restaurant.phone}
                    </Typography>
                  </Box>
                )}
              </Box>
                  )}
            </Box>
          </Box>
          
          {/* Informações do cliente (lado direito) */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoggedIn ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: themeColor, width: 40, height: 40 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ color: coverImageUrl ? 'white' : 'inherit' }}>
                    Olá, {userName}
                  </Typography>
                      <Typography variant="caption" sx={{ color: coverImageUrl ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
                    Meu Perfil
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Button 
                  variant="contained" 
                  sx={{ 
                        bgcolor: themeColor, 
                    mr: 1,
                    '&:hover': {
                          bgcolor: `${themeColor}e0` // Versão mais escura da cor do tema
                    }
                  }}
                >
                  Entrar
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                        borderColor: coverImageUrl ? 'white' : themeColor, 
                        color: coverImageUrl ? 'white' : themeColor,
                    '&:hover': {
                          borderColor: coverImageUrl ? 'rgba(255,255,255,0.8)' : `${themeColor}b0`,
                          bgcolor: coverImageUrl ? 'rgba(255,255,255,0.1)' : `${themeColor}10`
                    }
                  }}
                >
                  Cadastrar
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
        </Box>
        
        {/* Informações de contato (quando tem imagem de capa) */}
        {coverImageUrl && (restaurant.address || restaurant.phone || restaurant.openingHours) && (
          <Box
            sx={{
              width: '100%',
              backgroundColor: `${themeColor}10`,
              borderBottom: `1px solid ${themeColor}20`,
              borderTop: 'none',
              padding: '10px 0',
              mt: -3,
              pt: 4,
              position: 'relative',
              zIndex: 4,
              backgroundImage: `linear-gradient(to bottom, transparent, ${themeColor}15 40%)`,
            }}
          >
            <Container maxWidth="lg">
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' },
                  gap: { xs: 2, md: 4 },
                  py: 1
                }}
              >
                {restaurant.openingHours && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ color: themeColor, fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ color: '#333333', fontWeight: 'medium' }}>
                      {formattedOpeningHours}
                    </Typography>
                    <Box 
                      component="span" 
                      sx={{ 
                        ml: 1, 
                        bgcolor: isOpen ? 'success.main' : 'error.main', 
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        px: 1,
                        py: 0.3,
                        borderRadius: '4px'
                      }}
                    >
                      {isOpen ? 'ABERTO' : 'FECHADO'}
                    </Box>
                  </Box>
                )}
                
                {restaurant.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ color: themeColor, fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ color: '#333333', fontWeight: 'medium' }}>
                      {restaurant.address}
                    </Typography>
                  </Box>
                )}
                
                {restaurant.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ color: themeColor, fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ color: '#333333', fontWeight: 'medium' }}>
                      {restaurant.phone}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Container>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MenuHeader; 