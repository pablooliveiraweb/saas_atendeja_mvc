import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
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
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
  Text,
  Badge,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Image,
  Switch,
  Stack,
  Avatar,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { productsService } from '../../services/productsService';
import { categoriesService } from '../../services/categoriesService';
import { Product, ProductFormData } from '../../types/product';
import { Category } from '../../types/category';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';

export const Products: React.FC = () => {
  const { restaurant } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  // Modal para adicionar/editar produto
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    image: '',
    isActive: true,
    isAvailable: true,
  });
  
  // AlertDialog para confirmar exclusão
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Cores para o tema
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Não foi possível carregar os produtos.');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        categoryId: product.category?.id ?? product.categoryId ?? '',
        image: product.image ?? '',
        isActive: product.isActive,
        isAvailable: product.isAvailable,
        additionalOptions: product.additionalOptions ?? [],
      });
      setPriceInput(product.price.toString().replace('.', ','));
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: categories.length > 0 ? categories[0].id : '',
        image: '',
        isActive: true,
        isAvailable: true,
        additionalOptions: [],
      });
      setPriceInput('');
    }
    onOpen();
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Remove o prefixo "R$ " e quaisquer caracteres não numéricos, exceto vírgula e ponto
    const formattedValue = value.replace(/[R$\s]/g, '').replace(/[^\d.,]/g, '');
    
    // Guarda o valor digitado no estado
    setPriceInput(formattedValue);
    
    // Substitui vírgula por ponto para o cálculo
    const numericValue = formattedValue.replace(',', '.');
    
    // Verifica se é um número válido
    if (numericValue === '' || isNaN(parseFloat(numericValue))) {
      setFormData({
        ...formData,
        price: 0,
      });
    } else {
      setFormData({
        ...formData,
        price: parseFloat(numericValue),
      });
    }
  };

  // Função para formatar o preço quando o campo perde o foco
  const handlePriceBlur = () => {
    if (priceInput === '') {
      setPriceInput('0,00');
      return;
    }
    
    // Converte para número e depois formata com 2 casas decimais
    const numericValue = priceInput.replace(',', '.');
    if (!isNaN(parseFloat(numericValue))) {
      const formatted = parseFloat(numericValue).toFixed(2).replace('.', ',');
      setPriceInput(formatted);
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData({
      ...formData,
      [field]: e.target.checked,
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedProduct) {
        // Atualizar produto existente
        await productsService.update(selectedProduct.id, formData);
        toast({
          title: 'Sucesso',
          description: 'Produto atualizado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Criar novo produto
        await productsService.create(formData);
        toast({
          title: 'Sucesso',
          description: 'Produto criado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o produto.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    
    setIsDeleting(true);
    try {
      await productsService.delete(selectedProduct.id);
      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsAlertOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = (initialData?: Product) => {
    setFormData({
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      categoryId: initialData?.category?.id || '',
      isAvailable: initialData?.isAvailable ?? true,
      image: undefined,
    });
  };

  if (isLoading) {
    return (
      <Layout title="Produtos">
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title="Produtos">
      {/* Cabeçalho */}
      <Box mb={8} p={4} bg={cardBg} rounded="lg" shadow="sm">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" color={textColor}>Gerenciamento de Produtos</Heading>
            <Text color="gray.500" mt={1}>
              {restaurant?.name ? `Restaurante: ${restaurant.name}` : 'Gerencie os produtos do seu cardápio'}
            </Text>
          </Box>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={() => handleOpenModal()}
            size="md"
          >
            Novo Produto
          </Button>
        </Flex>
      </Box>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Lista de Produtos */}
      <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden" mb={8}>
        <CardHeader bg={headerBg} py={4}>
          <Heading size="md" color={textColor}>Produtos Cadastrados</Heading>
        </CardHeader>
        <CardBody p={0}>
          {products.length === 0 ? (
            <Box p={6} textAlign="center">
              <Text color="gray.500">Nenhum produto cadastrado.</Text>
              <Button 
                mt={4} 
                colorScheme="blue" 
                leftIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
              >
                Adicionar Produto
              </Button>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" width="100%">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th>Nome</Th>
                    <Th>Categoria</Th>
                    <Th isNumeric>Preço</Th>
                    <Th>Status</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.map((product) => (
                    <Tr key={product.id}>
                      <Td>
                        <Flex align="center">
                          <Avatar 
                            name={product.name} 
                            src={product.image} 
                            bg="blue.500" 
                            color="white"
                            size="sm"
                          />
                          <Text fontWeight="medium">{product.name}</Text>
                        </Flex>
                      </Td>
                      <Td>{product.category?.name || 'Sem categoria'}</Td>
                      <Td isNumeric>R$ {typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : Number(product.price).toFixed(2)}</Td>
                      <Td>
                        <Badge 
                          colorScheme={product.isAvailable ? 'green' : 'red'} 
                          display="flex" 
                          alignItems="center" 
                          width="fit-content"
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {product.isAvailable ? (
                            <>
                              <CheckCircleIcon mr={1} />
                              <Text>Disponível</Text>
                            </>
                          ) : (
                            <>
                              <WarningIcon mr={1} />
                              <Text>Indisponível</Text>
                            </>
                          )}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Editar produto"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleOpenModal(product)}
                          />
                          <IconButton
                            aria-label="Excluir produto"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(product)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Modal para adicionar/editar produto */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg={headerBg}>
            {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Nome</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nome do produto"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Descrição</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descrição do produto"
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Preço</FormLabel>
              <Input
                type="text"
                name="price"
                value={priceInput === '' ? '' : priceInput}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                placeholder="0,00"
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Categoria</FormLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                placeholder="Selecione uma categoria"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>URL da Imagem</FormLabel>
              <Input
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </FormControl>

            <Stack direction={["column", "row"]} spacing={6} mb={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Ativo</FormLabel>
                <Switch
                  isChecked={formData.isActive}
                  onChange={(e) => handleSwitchChange(e, 'isActive')}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Disponível</FormLabel>
                <Switch
                  isChecked={formData.isAvailable}
                  onChange={(e) => handleSwitchChange(e, 'isAvailable')}
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AlertDialog para confirmar exclusão */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef as any}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Produto
            </AlertDialogHeader>
            <AlertDialogBody>
              Tem certeza que deseja excluir o produto "{selectedProduct?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={isDeleting}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
};

export default Products;
