import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const headingColor = useColorModeValue('gray.900', 'white');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const errorBgColor = useColorModeValue('red.50', 'red.900');
  const errorTextColor = useColorModeValue('red.500', 'red.200');
  const overlayStartColor = useColorModeValue('blue.500', 'blue.900');
  const overlayEndColor = useColorModeValue('purple.500', 'purple.900');

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Redirecionando para /dashboard do Login');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <Flex h="100vh">
      {/* Lado esquerdo - Formulário */}
      <Box w="50%" p={8} display="flex" flexDirection="column" justifyContent="center">
        <Box maxW="400px" mx="auto" w="100%">
          <Heading mb={8} textAlign="center" color={headingColor}>Atende</Heading>
          <Text fontSize="lg" color={textColor} mb={8} textAlign="center">
            Gerencie seu negócio de forma simples e eficiente
          </Text>

          {error && (
            <Box
              p={4}
              w="full"
              bg={errorBgColor}
              borderRadius="md"
              color={errorTextColor}
              fontSize="sm"
            >
              {error}
            </Box>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} width="100%">
              <FormControl id="email" isRequired>
                <FormLabel color={labelColor}>Email</FormLabel>
                <Input
                  size="lg"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg={inputBgColor}
                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                  _hover={{
                    borderColor: useColorModeValue('gray.400', 'gray.500')
                  }}
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel color={labelColor}>Senha</FormLabel>
                <Input
                  size="lg"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg={inputBgColor}
                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                  _hover={{
                    borderColor: useColorModeValue('gray.400', 'gray.500')
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="100%"
                isLoading={loading}
              >
                Entrar
              </Button>
            </VStack>
          </form>
        </Box>
      </Box>

      {/* Lado direito - Imagem */}
      <Box
        w="50%"
        bg={bgColor}
        position="relative"
        overflow="hidden"
        display={{ base: 'none', md: 'block' }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={`linear(to-r, ${overlayStartColor}, ${overlayEndColor})`}
          opacity={0.9}
        />
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          alignItems="center"
          justifyContent="center"
          p={8}
          flexDirection="column"
          textAlign="center"
          color="white"
          zIndex={1}
        >
          <Heading size="2xl" mb={4}>
            Bem-vindo ao Atende
          </Heading>
          <Text fontSize="xl" maxW="500px">
            Sua plataforma completa para gestão de vendas, produtos e clientes
          </Text>
        </Flex>
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage="url('https://cdn.dribbble.com/userupload/10591531/file/original-a1f9c1b5b9e1c0d7a07c326d9d47f006.png?resize=1024x768')"
          bgSize="cover"
          bgPosition="center"
          opacity={0.15}
        />
      </Box>
    </Flex>
  );
};

export default Login; 