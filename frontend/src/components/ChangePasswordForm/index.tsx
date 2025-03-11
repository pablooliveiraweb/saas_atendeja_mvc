import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { api } from '../../services/api';
import axios from 'axios';

// Interface para representar o formato da resposta da API
interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

// Interface para erros do Axios
interface AxiosErrorResponse {
  response?: {
    status: number;
    data?: any;
    headers?: any;
  };
  request?: any;
  message?: string;
}

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Iniciando processo de alteração de senha');

    // Validação básica
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Todos os campos são obrigatórios',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Senhas diferentes',
        description: 'A nova senha e a confirmação não coincidem',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve ter pelo menos 6 caracteres',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Enviando requisição para alterar senha');
      
      // Criar o payload e logar para debug
      const payload = {
        currentPassword,
        newPassword,
        confirmPassword,
      };
      
      console.log('Payload da requisição:', JSON.stringify(payload, null, 2));
      
      const response = await api.post<ChangePasswordResponse>('/auth/change-password', payload);

      // Logar a resposta completa para debug
      console.log('Resposta completa:', response);
      console.log('Status da resposta:', response.status);
      console.log('Dados da resposta:', JSON.stringify(response.data, null, 2));

      const data = response.data;

      if (data.success) {
        console.log('Senha alterada com sucesso:', data);
        toast({
          title: 'Senha alterada',
          description: 'Sua senha foi alterada com sucesso!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Limpar o formulário
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        console.error('Falha ao alterar senha:', data);
        toast({
          title: 'Erro',
          description: data.message || 'Ocorreu um erro ao alterar a senha',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: unknown) {
      console.error('Erro ao alterar senha:', error);
      
      // Verificar se é um erro do Axios e extrair mais informações
      const axiosError = error as AxiosErrorResponse;
      
      if (axiosError.response) {
        // A requisição foi feita e o servidor respondeu com um status fora do intervalo 2xx
        console.error('Erro na resposta do servidor:', {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers
        });
        
        // Mostrar um toast com uma mensagem mais específica
        toast({
          title: `Erro ${axiosError.response.status}`,
          description: axiosError.response.data?.message || 'Erro ao processar a alteração de senha',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (axiosError.request) {
        // A requisição foi feita mas não houve resposta
        console.error('Sem resposta do servidor:', axiosError.request);
        toast({
          title: 'Sem resposta do servidor',
          description: 'A requisição foi enviada, mas não houve resposta do servidor',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Erro genérico ou algo aconteceu ao configurar a requisição
        console.error('Erro:', error);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao alterar a senha. Tente novamente mais tarde.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Alterar Senha
      </Text>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl id="currentPassword" isRequired>
            <FormLabel>Senha Atual</FormLabel>
            <InputGroup>
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showCurrentPassword ? 'Esconder senha' : 'Mostrar senha'}
                  icon={showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Se você não lembra sua senha atual, pode prosseguir mesmo assim. O sistema irá permitir a troca.
            </Text>
          </FormControl>
          
          <FormControl id="newPassword" isRequired>
            <FormLabel>Nova Senha</FormLabel>
            <InputGroup>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showNewPassword ? 'Esconder senha' : 'Mostrar senha'}
                  icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          
          <FormControl id="confirmPassword" isRequired>
            <FormLabel>Confirmar Nova Senha</FormLabel>
            <InputGroup>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showConfirmPassword ? 'Esconder senha' : 'Mostrar senha'}
                  icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          
          <Button
            colorScheme="teal"
            type="submit"
            isLoading={isLoading}
            width="full"
            mt={4}
          >
            Alterar Senha
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default ChangePasswordForm; 