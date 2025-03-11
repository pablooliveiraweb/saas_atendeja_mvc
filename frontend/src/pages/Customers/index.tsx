import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Badge,
  FormErrorMessage,
  Textarea,
  Flex,
  InputGroup,
  InputLeftElement,
  ModalCloseButton,
  Switch,
  FormHelperText,
  Spinner,
  Text,
  HStack,
  Icon,
  InputRightElement,
  Stack,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, PhoneIcon, EmailIcon } from '@chakra-ui/icons';
import { useForm, Controller } from 'react-hook-form';
import Layout from '../../components/Layout';
import { customersService } from '../../services/customersService';
import { Customer, CustomerFormData } from '../../types/customer';
import { FaUserAltSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface CustomerFormProps {
  onSubmit: (data: Customer) => void;
  initialData?: Customer;
  isEditing?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, initialData, isEditing }) => {
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<CustomerFormData>({
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      isActive: true,
    }
  });

  // Função para formatar o telefone
  const formatPhone = (value: string) => {
    if (!value) return '';
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Formata como (XX) XXXXX-XXXX
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Função para formatar CPF/CNPJ
  const formatDocument = (value: string) => {
    if (!value) return '';
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // CPF: 000.000.000-00
    if (numbers.length <= 11) {
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    } 
    // CNPJ: 00.000.000/0000-00
    else {
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
      if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  return (
    <form onSubmit={handleSubmit((data: CustomerFormData) => {
      onSubmit({
        ...data,
        id: initialData?.id || '',
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: data.isActive ?? true
      });
    })}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Nome</FormLabel>
          <Input
            {...register('name', { 
              required: 'Nome é obrigatório',
              minLength: { value: 3, message: 'Nome deve ter no mínimo 3 caracteres' }
            })}
            placeholder="Nome do cliente"
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email} isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            {...register('email', {
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido'
              }
            })}
            type="email"
            placeholder="email@exemplo.com"
          />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.phone} isRequired>
          <FormLabel>Telefone</FormLabel>
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Telefone é obrigatório' }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="(00) 00000-0000"
                value={formatPhone(field.value)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  field.onChange(value.substring(0, 11));
                }}
              />
            )}
          />
          <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.document}>
          <FormLabel>CPF/CNPJ</FormLabel>
          <Controller
            name="document"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={formatDocument(field.value || '')}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  field.onChange(value.substring(0, 14)); // Limita a 14 dígitos (CNPJ)
                }}
              />
            )}
          />
          <FormHelperText>Digite apenas os números</FormHelperText>
          <FormErrorMessage>{errors.document?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.address}>
          <FormLabel>Endereço</FormLabel>
          <Input
            {...register('address')}
            placeholder="Endereço completo"
          />
          <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.notes}>
          <FormLabel>Observações</FormLabel>
          <Textarea
            {...register('notes')}
            placeholder="Observações sobre o cliente"
            rows={3}
          />
          <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="isActive" mb="0">
            Cliente Ativo
          </FormLabel>
          <Switch
            id="isActive"
            {...register('isActive')}
            defaultChecked={initialData?.isActive ?? true}
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          mt={4}
        >
          {isEditing ? 'Atualizar' : 'Cadastrar'} Cliente
        </Button>
      </VStack>
    </form>
  );
};

const Customers: React.FC = () => {
  const { restaurant } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingExamples, setIsCreatingExamples] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>();

  useEffect(() => {
    // Obter o ID do restaurante do contexto de autenticação
    if (restaurant && restaurant.id) {
      console.log('Restaurante encontrado no contexto de autenticação:', restaurant.id);
      setRestaurantId(restaurant.id);
    } else {
      // Tentar obter do localStorage como fallback
      const storedRestaurantId = localStorage.getItem('@Atende:restaurant');
      if (storedRestaurantId) {
        try {
          const parsedRestaurant = JSON.parse(storedRestaurantId);
          if (parsedRestaurant && parsedRestaurant.id) {
            console.log('Restaurante encontrado no localStorage:', parsedRestaurant.id);
            setRestaurantId(parsedRestaurant.id);
          }
        } catch (error) {
          console.error('Erro ao parsear restaurante do localStorage:', error);
        }
      } else {
        console.warn('Nenhum restaurante encontrado no localStorage');
      }
    }
  }, [restaurant]);

  // Buscar clientes quando o restaurantId for definido
  useEffect(() => {
    if (restaurantId) {
      fetchCustomers();
    }
  }, [restaurantId]);

  const fetchCustomers = async () => {
    if (!restaurantId) {
      console.error('ID do restaurante não disponível');
      toast({
        title: 'Erro',
        description: 'ID do restaurante não disponível. Tente fazer login novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Buscando clientes para restaurante:', restaurantId);
      const data = await customersService.getAll(restaurantId);
      
      // Verificar se existem dados
      if (data && data.length > 0) {
        console.log(`Encontrados ${data.length} clientes`);
        setCustomers(data);
      } else {
        console.log('Nenhum cliente encontrado');
        setCustomers([]);
        // Mostrar mensagem amigável quando não houver clientes
        toast({
          title: 'Nenhum cliente encontrado',
          description: 'Não há clientes cadastrados no sistema. Adicione um novo cliente para começar.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao buscar os clientes. Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!restaurantId) return;
    try {
      setIsLoading(true);
      if (searchQuery.trim()) {
        const data = await customersService.search(searchQuery, restaurantId);
        setCustomers(data);
        
        // Mostrar mensagem se a busca não retornar resultados
        if (data.length === 0) {
          toast({
            title: 'Nenhum resultado encontrado',
            description: `Não foram encontrados clientes para a busca "${searchQuery}"`,
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        fetchCustomers();
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível realizar a busca. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    reset({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      isActive: true,
    });
    onOpen();
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
      isActive: customer.isActive,
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!restaurantId) return;
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        setIsDeleting(true);
        await customersService.remove(id, restaurantId);
        setCustomers(customers.filter(customer => customer.id !== id));
        toast({
          title: 'Cliente excluído',
          description: 'Cliente excluído com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir o cliente',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    if (!restaurantId) return;
    try {
      setIsLoading(true);
      console.log('Enviando requisição para:', (process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/api/customers');
      if (selectedCustomer) {
        // Atualizar cliente existente
        const updatedCustomer = await customersService.update(selectedCustomer.id, data, restaurantId);
        setCustomers(customers.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c)));
        toast({
          title: 'Cliente atualizado',
          description: 'O cliente foi atualizado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Criar novo cliente
        const newCustomer = await customersService.create(data, restaurantId);
        setCustomers([...customers, newCustomer]);
        toast({
          title: 'Cliente adicionado',
          description: 'O cliente foi adicionado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o cliente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para criar clientes de exemplo
  const handleCreateExampleClients = async () => {
    if (!restaurantId) return;
    try {
      setIsCreatingExamples(true);
      
      const exampleClients = [
        {
          name: "Maria Silva",
          email: "maria.silva@exemplo.com",
          phone: "11987654321",
          address: "Av. Paulista, 1000, São Paulo - SP",
          notes: "Cliente preferencial",
          isActive: true
        },
        {
          name: "João Oliveira",
          email: "joao.oliveira@exemplo.com",
          phone: "11912345678",
          address: "Rua Augusta, 500, São Paulo - SP",
          notes: "Prefere entregas aos finais de semana",
          isActive: true
        },
        {
          name: "Ana Souza",
          email: "ana.souza@exemplo.com",
          phone: "11998765432",
          address: "Av. Rebouças, 200, São Paulo - SP",
          notes: "Cliente desde 2020",
          isActive: true
        },
        {
          name: "Carlos Mendes",
          email: "carlos.mendes@exemplo.com",
          phone: "11977778888",
          address: "Rua Oscar Freire, 300, São Paulo - SP",
          notes: "Solicita nota fiscal",
          isActive: true
        },
        {
          name: "Roberto Almeida",
          email: "roberto.almeida@exemplo.com",
          phone: "11988887777",
          address: "Av. Paulista, 1500, São Paulo - SP",
          notes: "Cliente para testes",
          isActive: true
        }
      ];
      
      // Criar os clientes de exemplo sequencialmente
      const createdClients: Customer[] = [];
      
      for (const clientData of exampleClients) {
        try {
          const newClient = await customersService.create(clientData, restaurantId);
          createdClients.push(newClient);
        } catch (error) {
          console.error(`Erro ao criar cliente ${clientData.name}:`, error);
        }
      }
      
      // Atualizar a lista de clientes
      if (createdClients.length > 0) {
        setCustomers(createdClients);
        
        toast({
          title: 'Clientes de exemplo criados',
          description: `${createdClients.length} clientes de exemplo foram criados com sucesso.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível criar os clientes de exemplo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao criar clientes de exemplo:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar os clientes de exemplo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingExamples(false);
    }
  };

  return (
    <Layout title="Clientes">
      <Box p={4}>
        <Container maxW="container.xl">
          {/* Cabeçalho com título e botão de adicionar */}
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="lg">Clientes</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={handleAddCustomer}
            >
              Adicionar Cliente
            </Button>
          </Flex>

          {/* Barra de pesquisa */}
          <Flex mb={6}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Pesquisar clientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </InputGroup>
            <Button ml={2} onClick={handleSearch} isLoading={isLoading}>
              Buscar
            </Button>
          </Flex>

          {/* Tabela de clientes */}
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Telefone</Th>
                <Th>Email</Th>
                <Th>Endereço</Th>
                <Th>Status</Th>
                <Th width="200px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={10}>
                    <Spinner size="xl" color="blue.500" />
                    <Text mt={4} color="gray.500">Carregando clientes...</Text>
                  </Td>
                </Tr>
              ) : customers.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={10}>
                    <Box>
                      <Icon as={FaUserAltSlash} boxSize="50px" color="gray.400" />
                      <Text mt={4} fontSize="lg" fontWeight="medium" color="gray.500">
                        Nenhum cliente encontrado
                      </Text>
                      <Text fontSize="md" color="gray.400" maxWidth="500px" mx="auto" mt={2}>
                        Não existem clientes cadastrados no sistema ou sua busca não retornou resultados.
                      </Text>
                      <Flex mt={6} justifyContent="center" gap={4}>
                        <Button 
                          leftIcon={<AddIcon />}
                          colorScheme="blue"
                          onClick={handleAddCustomer}
                        >
                          Adicionar Cliente
                        </Button>
                        <Button 
                          colorScheme="green"
                          onClick={handleCreateExampleClients}
                          isLoading={isCreatingExamples}
                        >
                          Criar Clientes de Exemplo
                        </Button>
                      </Flex>
                    </Box>
                  </Td>
                </Tr>
              ) : (
                customers.map((customer) => (
                  <Tr key={customer.id}>
                    <Td>{customer.name}</Td>
                    <Td>{customer.phone}</Td>
                    <Td>{customer.email}</Td>
                    <Td>{customer.address}</Td>
                    <Td>
                      <Badge colorScheme={customer.isActive ? 'green' : 'red'}>
                        {customer.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Editar cliente"
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleEditCustomer(customer)}
                        />
                        <IconButton
                          aria-label="Excluir cliente"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(customer.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

          {/* Modal de Adicionar/Editar Cliente */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {selectedCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <CustomerForm
                  onSubmit={onSubmit}
                  initialData={selectedCustomer || undefined}
                  isEditing={!!selectedCustomer}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
    </Layout>
  );
};

export default Customers; 