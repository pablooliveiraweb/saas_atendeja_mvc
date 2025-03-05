import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Flex,
  IconButton,
  FormErrorMessage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Text,
  Badge,
  Stack,
  Alert,
  AlertIcon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { categoriesService, Category } from '../services/categoriesService';
import { productsService, CreateProductData, Product } from '../services/productsService';
import { useAuth } from '../contexts/AuthContext';

// Interface para o formulário
type ProductFormData = {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isActive: boolean;
  isAvailable: boolean;
  order?: number;
};

const Products: React.FC = () => {
  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Hook do Chakra UI para o toast
  const toast = useToast();
  
  // Hook do Chakra UI para o modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Hook do React Hook Form
  const { 
    handleSubmit, 
    register, 
    reset, 
    setValue, 
    formState: { errors } 
  } = useForm<ProductFormData>();

  // Hook do contexto de autenticação
  const { restaurant } = useAuth();

  // Buscar produtos e categorias ao montar o componente
  useEffect(() => {
    fetchData();
  }, []);

  // Função para buscar dados
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!restaurant) {
        setError('Você precisa estar associado a um restaurante para gerenciar produtos.');
        setLoading(false);
        return;
      }
      
      // Buscar categorias e produtos
      const [categoriesData, productsData] = await Promise.all([
        categoriesService.getAll(),
        productsService.getAll()
      ]);
      
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (err) {
      setError('Erro ao carregar dados. Tente novamente.');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para criar produto
  const handleAddProduct = () => {
    if (!restaurant) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar associado a um restaurante para criar produtos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setCurrentProduct(null);
    reset({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      isActive: true,
      isAvailable: true,
      order: 0,
    });
    onOpen();
  };

  // Abrir modal para editar produto
  const handleEditProduct = (product: Product) => {
    if (!restaurant) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar associado a um restaurante para editar produtos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setCurrentProduct(product);
    // Preencher o formulário com os dados do produto
    setValue('name', product.name);
    setValue('description', product.description || '');
    setValue('price', product.price);
    setValue('categoryId', product.category.id);
    setValue('isActive', product.isActive);
    setValue('isAvailable', product.isAvailable);
    setValue('order', product.order);
    onOpen();
  };

  // Processar submissão do formulário
  const onSubmit = async (data: ProductFormData) => {
    try {
      if (!restaurant) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar associado a um restaurante para gerenciar produtos.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      setLoading(true);
      
      if (currentProduct) {
        // Atualizar produto existente
        await productsService.update(currentProduct.id, data);
        toast({
          title: 'Produto atualizado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Criar novo produto
        await productsService.create(data as CreateProductData);
        toast({
          title: 'Produto criado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Recarregar os dados
      await fetchData();
      onClose();
    } catch (err) {
      const errorMsg = currentProduct
        ? 'Erro ao atualizar produto.'
        : 'Erro ao criar produto.';
      
      toast({
        title: errorMsg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      console.error(errorMsg, err);
    } finally {
      setLoading(false);
    }
  };

  // Excluir produto
  const handleDeleteProduct = async (productId: string) => {
    if (!restaurant) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar associado a um restaurante para excluir produtos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    
    try {
      setLoading(true);
      await productsService.delete(productId);
      
      toast({
        title: 'Produto excluído',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Recarregar os dados
      await fetchData();
    } catch (err) {
      toast({
        title: 'Erro ao excluir produto',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      console.error('Erro ao excluir produto:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Produtos">
      <Box py={5}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Produtos</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={handleAddProduct}
            isDisabled={loading || !restaurant}
          >
            Adicionar Produto
          </Button>
        </Flex>

        {/* Exibir mensagem se não houver restaurante associado */}
        {!restaurant && (
          <Alert status="warning" mb={4}>
            <AlertIcon />
            Você precisa estar associado a um restaurante para gerenciar produtos.
          </Alert>
        )}

        {/* Exibir mensagem de erro, se houver */}
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Exibir spinner durante o carregamento */}
        {loading && !products.length ? (
          <Flex justify="center" my={8}>
            <Spinner size="xl" />
          </Flex>
        ) : (
          <>
            {/* Tabela de produtos */}
            {products.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th>Categoria</Th>
                      <Th>Preço</Th>
                      <Th>Status</Th>
                      <Th>Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {products.map((product) => (
                      <Tr key={product.id}>
                        <Td>{product.name}</Td>
                        <Td>{product.category.name}</Td>
                        <Td>R$ {product.price.toFixed(2)}</Td>
                        <Td>
                          <Stack direction="row">
                            {product.isActive ? (
                              <Badge colorScheme="green">Ativo</Badge>
                            ) : (
                              <Badge colorScheme="red">Inativo</Badge>
                            )}
                            {product.isAvailable ? (
                              <Badge colorScheme="blue">Disponível</Badge>
                            ) : (
                              <Badge colorScheme="orange">Indisponível</Badge>
                            )}
                          </Stack>
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Editar produto"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            mr={2}
                            onClick={() => handleEditProduct(product)}
                            isDisabled={!restaurant}
                          />
                          <IconButton
                            aria-label="Excluir produto"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteProduct(product.id)}
                            isDisabled={!restaurant}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box textAlign="center" py={10}>
                <Text>Nenhum produto cadastrado.</Text>
              </Box>
            )}
          </>
        )}

        {/* Modal de formulário */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {currentProduct ? 'Editar Produto' : 'Novo Produto'}
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalBody>
                <FormControl isInvalid={!!errors.name} mb={4} isRequired>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    {...register('name', { required: 'Nome é obrigatório' })}
                    placeholder="Nome do produto"
                  />
                  {errors.name && (
                    <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Descrição</FormLabel>
                  <Textarea
                    {...register('description')}
                    placeholder="Descrição do produto"
                  />
                </FormControl>

                <FormControl isInvalid={!!errors.price} mb={4} isRequired>
                  <FormLabel>Preço</FormLabel>
                  <NumberInput min={0} precision={2} step={0.01}>
                    <NumberInputField
                      {...register('price', {
                        required: 'Preço é obrigatório',
                        min: {
                          value: 0,
                          message: 'O preço deve ser maior ou igual a zero',
                        },
                      })}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  {errors.price && (
                    <FormErrorMessage>{errors.price.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.categoryId} mb={4} isRequired>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    {...register('categoryId', {
                      required: 'Categoria é obrigatória',
                    })}
                    placeholder="Selecione uma categoria"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  {errors.categoryId && (
                    <FormErrorMessage>{errors.categoryId.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Ordem de exibição</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      {...register('order')}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Flex justifyContent="space-between" mb={4}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Ativo</FormLabel>
                    <Switch {...register('isActive')} defaultChecked />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Disponível</FormLabel>
                    <Switch {...register('isAvailable')} defaultChecked />
                  </FormControl>
                </Flex>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={loading}
                  loadingText="Salvando"
                >
                  Salvar
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
};

export default Products; 