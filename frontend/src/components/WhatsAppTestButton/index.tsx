import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Box, 
  Text, 
  useToast, 
  Input, 
  FormControl, 
  FormLabel, 
  Flex, 
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  Center,
  Badge,
  Tooltip,
  Stack
} from '@chakra-ui/react';
import { FaWhatsapp } from 'react-icons/fa';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Removendo interface não utilizada
// interface WhatsAppMessage {
//   number: string;
//   text: string;
//   delay?: number;
// }

interface WhatsAppResponse {
  status?: string;
  message?: string;
  qrcode?: string;
  base64?: string;
  pairingCode?: string;
  connectionStatus?: string;
  state?: string;
  [key: string]: any;
}

interface Restaurant {
  id: string;
  name: string;
  evolutionApiInstanceName?: string;
  evolutionApiInstanceConnected?: boolean;
  evolutionApiInstanceToken?: string;
  [key: string]: any;
}

interface WhatsAppTestButtonProps {
  restaurantId: string;
}

const WhatsAppTestButton: React.FC<WhatsAppTestButtonProps> = ({ restaurantId }) => {
  const { token, restaurant: authRestaurant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Olá! Esta é uma mensagem de teste do AtendeJá.');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('verificando');
  const [instanceName, setInstanceName] = useState<string>('');
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Refs para controlar notificações duplicadas
  const lastConnectionStatusRef = useRef<boolean | null>(null);
  const toast = useToast();

  // Verificar o status da conexão quando o componente é montado
  useEffect(() => {
    if (restaurantId && token) {
      // Verificar o status inicial apenas uma vez
      checkConnectionStatus();
      
      return () => {
        // Limpar o intervalo quando o componente é desmontado
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
        }
      };
    }
  }, [restaurantId, token]);

  // Verificar periodicamente o status da conexão quando o modal do QR Code está aberto
  useEffect(() => {
    if (isQrModalOpen && restaurantId) {
      // Cancelar qualquer verificação anterior
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
      
      // Iniciar a verificação periódica com frequência maior quando o modal está aberto
      statusCheckIntervalRef.current = setInterval(() => {
        checkConnectionStatus();
      }, 5000); // Verificar a cada 5 segundos quando o modal está aberto
    } else {
      // Parar a verificação quando o modal for fechado
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    }
    
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [isQrModalOpen, restaurantId]);

  // Usando function declaration para beneficiar do hoisting
  async function checkConnectionStatus() {
    try {
      setIsLoading(true);
      
      // Usar o restaurante do contexto de autenticação se disponível
      let restaurantInstanceName = '';
      
      if (authRestaurant && authRestaurant.evolutionApiInstanceName) {
        // Usar o nome da instância do restaurante do contexto de autenticação
        restaurantInstanceName = authRestaurant.evolutionApiInstanceName;
      } else {
        // Caso contrário, buscar o restaurante pelo ID
        try {
          const restaurantResponse = await api.get<Restaurant>(`/restaurants/${restaurantId}`);
          if (restaurantResponse.data && restaurantResponse.data.evolutionApiInstanceName) {
            restaurantInstanceName = restaurantResponse.data.evolutionApiInstanceName;
          }
        } catch (error) {
          console.error('Erro ao buscar dados do restaurante:', error);
          setConnectionStatus('erro_busca');
          setIsWhatsAppConnected(false);
          setIsLoading(false);
          return;
        }
      }
      
      if (!restaurantInstanceName) {
        setConnectionStatus('não_configurado');
        setIsWhatsAppConnected(false);
        setIsLoading(false);
        return;
      }
      
      // Armazenar o nome da instância para uso em outras funções
      setInstanceName(restaurantInstanceName);
      
      // Verificar o status usando o endpoint da Evolution API
      const response = await api.get<WhatsAppResponse>(`/evolution-api/instances/${restaurantInstanceName}/status`);
      
      // A resposta pode conter vários formatos diferentes
      let connectionState = '';
      
      // Verificar todos os possíveis caminhos da resposta
      if (response.data?.instance?.state) {
        // Formato: {"instance":{"instanceName":"restaurant_xyz","state":"open"}}
        connectionState = response.data.instance.state;
      } else if (response.data?.state) {
        connectionState = response.data.state;
      } else if (response.data?.status) {
        connectionState = response.data.status;
      } else if (response.data?.data?.status) {
        connectionState = response.data.data.status;
      } else if (response.data?.data?.state) {
        connectionState = response.data.data.state;
      } else if (response.data?.connection) {
        connectionState = response.data.connection;
      } else {
        connectionState = 'desconhecido';
      }
      
      setConnectionStatus(connectionState);
      
      // Verificação específica para "open" e "close"
      const stateLowerCase = connectionState.toLowerCase().trim();
      
      // Lista de estados que indicam "conectando" mas NÃO "conectado"
      const connectingStates = [
        'connecting', 'conectando', 'scanning', 'escaneando', 'qrread', 'loading',
        'starting', 'iniciando', 'waiting', 'esperando', 'pending', 'pendente'
      ];
      
      // Verificar se o estado atual é um estado de "conectando"
      const isConnecting = connectingStates.some(state => 
        stateLowerCase.includes(state) || stateLowerCase === state
      );
      
      // Se estiver no estado "conectando", não consideramos como conectado
      if (isConnecting) {
        return; // Sai da função sem alterar o estado de isWhatsAppConnected
      }
      
      // Verificação direta se o estado é "open" (conectado) ou "close" (desconectado)
      let isConnected = false;
      
      if (stateLowerCase === 'open') {
        isConnected = true;
      } else if (stateLowerCase === 'close' || stateLowerCase === 'closed') {
        isConnected = false;
      } else {
        // Para outros casos, verificamos padrões conhecidos
        const connectedStates = [
          'connect', 'connected', 'online', 'authenticated', 'active', 
          'loggedin', 'success', 'ready', 'disponível', 'disponivel', 'ativo',
          'conexão estabelecida', 'conexao estabelecida', 'autenticado'
        ];
        
        // Verifica se algum dos padrões existe na string de status
        isConnected = connectedStates.some(state => 
          stateLowerCase.includes(state) || stateLowerCase === state
        );
      }
        
      // Verifica se o status de conexão mudou desde a última verificação
      const statusChanged = isConnected !== isWhatsAppConnected;
      
      // Verifica se já mostramos uma notificação para este estado de conexão
      const alreadyNotified = lastConnectionStatusRef.current === isConnected;
      
      // Atualiza apenas se o status mudou
      if (statusChanged) {
        setIsWhatsAppConnected(isConnected);
        
        // Mostrar notificação apenas se não mostramos anteriormente
        if (!alreadyNotified) {
          // Se acabou de conectar, mostrar toast
          if (isConnected) {
            toast({
              title: 'WhatsApp conectado',
              description: 'Seu WhatsApp foi conectado com sucesso! Agora você pode enviar mensagens.',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            
            // Se o modal estiver aberto, fechá-lo
            if (isQrModalOpen) {
              setIsQrModalOpen(false);
            }
          } else {
            // Se acabou de desconectar, mostrar toast
            toast({
              title: 'WhatsApp desconectado',
              description: 'Seu WhatsApp foi desconectado. Você precisará reconectar para enviar mensagens.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          }
          
          // Atualizar o status da última notificação
          lastConnectionStatusRef.current = isConnected;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      setConnectionStatus('erro');
      setIsWhatsAppConnected(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleTestWhatsApp = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Número de telefone obrigatório',
        description: 'Por favor, informe um número de telefone para enviar a mensagem de teste.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<WhatsAppResponse>(`/restaurants/${restaurantId}/whatsapp/send`, {
        number: phoneNumber,
        text: message,
      });

      if (response.data && (response.data.status === 'success' || response.data.status === 'SENT')) {
        toast({
          title: 'Mensagem enviada com sucesso!',
          description: 'A mensagem de teste foi enviada para o WhatsApp informado.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Falha ao enviar mensagem',
          description: response.data?.message || 'Ocorreu um erro ao enviar a mensagem de teste.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao testar WhatsApp:', error);
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Ocorreu um erro ao enviar a mensagem de teste. Verifique se a instância do WhatsApp está conectada.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para obter o QR Code e estabelecer a conexão
  const handleGetQrCode = async () => {
    setIsLoading(true);
    try {
      // Ao iniciar a obtenção do QR Code, resetamos o status de conexão
      // para garantir que não haverá falso positivo
      setIsWhatsAppConnected(false);
      setConnectionStatus('aguardando_leitura');
      lastConnectionStatusRef.current = null; // Resetar para permitir novas notificações
      
      // Usar o endpoint específico do restaurante para obter o QR code
      // Isso garante que estamos conectando a instância correta
      const response = await api.get<WhatsAppResponse>(`/restaurants/${restaurantId}/whatsapp/qrcode`);
      
      // Obter o QR code da resposta (seja qrcode ou base64)
      const qrCodeImage = response.data?.qrcode || response.data?.base64;
      
      if (qrCodeImage) {
        // Em vez de abrir uma nova janela, armazenamos o QR code e abrimos o modal
        setQrCodeData(qrCodeImage);
        setIsQrModalOpen(true);
        
        // Aguardar um momento antes de verificar o status para evitar falsos positivos
        // devido a respostas antigas no cache
        setTimeout(() => {
          checkConnectionStatus();
        }, 1000);
      } else {
        toast({
          title: 'QR Code não disponível',
          description: 'Não foi possível obter o QR Code para conexão.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      toast({
        title: 'Erro ao obter QR Code',
        description: 'Ocorreu um erro ao obter o QR Code para conexão do WhatsApp.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
        <Stack spacing={4}>
          <Flex alignItems="center" justifyContent="space-between">
            <Text fontSize="xl" fontWeight="bold">
              Integração com WhatsApp
            </Text>
            <Tooltip label={`Status atual: ${connectionStatus}`}>
              <Flex alignItems="center">
                <Box 
                  w={3} 
                  h={3} 
                  borderRadius="full" 
                  bg={
                    isWhatsAppConnected 
                      ? "green.500" 
                      : connectionStatus === 'aguardando_leitura' 
                        ? "yellow.500" 
                        : "red.500"
                  } 
                  mr={2}
                  boxShadow={isWhatsAppConnected ? "0 0 10px rgba(72, 187, 120, 0.7)" : "none"}
                />
                <Badge 
                  colorScheme={
                    isWhatsAppConnected 
                      ? "green" 
                      : connectionStatus === 'aguardando_leitura' 
                        ? "yellow" 
                        : "red"
                  } 
                  p={1} 
                  borderRadius="md"
                >
                  {isWhatsAppConnected 
                    ? "Conectado" 
                    : connectionStatus === 'aguardando_leitura' 
                      ? "Aguardando QR Code" 
                      : connectionStatus === 'verificando'
                        ? "Verificando status..."
                        : connectionStatus === 'não_configurado'
                          ? "Não configurado"
                          : "Desconectado"
                  }
                </Badge>
              </Flex>
            </Tooltip>
          </Flex>
          
          {/* Botões de ação */}
          <Flex justifyContent="space-between" wrap="wrap" gap={2}>
            <Button 
              colorScheme="blue" 
              leftIcon={<FaWhatsapp />} 
              onClick={handleGetQrCode} 
              isLoading={isLoading}
              size="sm"
            >
              {isWhatsAppConnected ? "Reconectar WhatsApp" : "Conectar WhatsApp"}
            </Button>
            
            <Button
              colorScheme="gray"
              size="sm"
              onClick={checkConnectionStatus}
              isLoading={isLoading}
            >
              Verificar Status
            </Button>
          </Flex>
          
          <FormControl>
            <FormLabel>Número de Telefone</FormLabel>
            <Input 
              placeholder="Ex: 5511999999999" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Mensagem de Teste</FormLabel>
            <Input 
              placeholder="Digite a mensagem de teste" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
            />
          </FormControl>
          
          <Button 
            colorScheme="teal" 
            onClick={handleTestWhatsApp} 
            isLoading={isLoading}
            isDisabled={!phoneNumber || !isWhatsAppConnected}
            width="full"
          >
            Enviar Mensagem de Teste
          </Button>
          
          {!isWhatsAppConnected && (
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Escaneie o QR Code para conectar o WhatsApp antes de enviar mensagens
            </Text>
          )}
        </Stack>
      </Box>

      {/* Modal para exibir o QR Code */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>QR Code para Conexão do WhatsApp</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4} textAlign="center">
              Abra o WhatsApp no seu celular, vá em Configurações &gt; Dispositivos conectados &gt; Conectar um dispositivo e escaneie o QR Code abaixo:
            </Text>
            <Center mb={4}>
              {qrCodeData ? (
                <Image src={qrCodeData} alt="QR Code WhatsApp" maxH="300px" />
              ) : (
                <Spinner size="xl" />
              )}
            </Center>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Verificando status de conexão... O modal fechará automaticamente quando a conexão for estabelecida.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default WhatsAppTestButton;