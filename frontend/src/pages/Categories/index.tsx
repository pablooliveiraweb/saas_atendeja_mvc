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
  Textarea,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { categoriesService } from '../../services/categoriesService';
import { Category, CategoryFormData } from '../../types/category';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';

export const Categories: React.FC = () => {
  const { restaurant } = useAuth();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Modal para adicionar/editar categoria
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    order: 0,
    isActive: true,
  });
  
  // AlertDialog para confirmar exclusão
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Cores para o tema
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const categories = await categoriesService.getAll();
      setCategories(categories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setError('Não foi possível carregar as categorias.');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        order: category.order,
        isActive: category.isActive,
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        order: 0,
        isActive: true,
      });
    }
    onOpen();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      isActive: e.target.checked,
    });
  };

  const handleNumberChange = (value: string) => {
    setFormData({
      ...formData,
      order: parseInt(value) || 0,
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedCategory) {
        // Atualizar categoria existente
        await categoriesService.update(selectedCategory.id, formData);
        toast({
          title: 'Sucesso',
          description: 'Categoria atualizada com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Criar nova categoria
        await categoriesService.create(formData);
        toast({
          title: 'Sucesso',
          description: 'Categoria criada com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a categoria.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    
    try {
      await categoriesService.delete(selectedCategory.id);
      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsAlertOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a categoria.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Layout title="Categorias">
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title="Categorias">
      {/* Cabeçalho */}
      <Box mb={8} p={4} bg={cardBg} rounded="lg" shadow="sm">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" color={textColor}>Gerenciamento de Categorias</Heading>
            <Text color="gray.500" mt={1}>
              {restaurant?.name ? `Restaurante: ${restaurant.name}` : 'Organize as categorias do seu cardápio'}
            </Text>
          </Box>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={() => handleOpenModal()}
            size="md"
          >
            Nova Categoria
          </Button>
        </Flex>
      </Box>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Lista de Categorias */}
      <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden" mb={8}>
        <CardHeader bg={headerBg} py={4}>
          <Heading size="md" color={textColor}>Categorias Cadastradas</Heading>
        </CardHeader>
        <CardBody p={0}>
          {categories.length === 0 ? (
            <Box p={6} textAlign="center">
              <Text color="gray.500">Nenhuma categoria cadastrada.</Text>
              <Button 
                mt={4} 
                colorScheme="blue" 
                leftIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
              >
                Adicionar Categoria
              </Button>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" width="100%">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th>Nome</Th>
                    <Th>Descrição</Th>
                    <Th isNumeric>Ordem</Th>
                    <Th>Status</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {categories.map((category) => (
                    <Tr key={category.id}>
                      <Td fontWeight="medium">{category.name}</Td>
                      <Td>{category.description || '-'}</Td>
                      <Td isNumeric>{category.order}</Td>
                      <Td>
                        <Badge 
                          colorScheme={category.isActive ? 'green' : 'red'} 
                          display="flex" 
                          alignItems="center" 
                          width="fit-content"
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {category.isActive ? (
                            <>
                              <CheckCircleIcon mr={1} />
                              <Text>Ativa</Text>
                            </>
                          ) : (
                            <>
                              <WarningIcon mr={1} />
                              <Text>Inativa</Text>
                            </>
                          )}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Editar categoria"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleOpenModal(category)}
                          />
                          <IconButton
                            aria-label="Excluir categoria"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(category)}
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

      {/* Modal para adicionar/editar categoria */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Nome</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nome da categoria"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Descrição</FormLabel>
              <Textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Descrição da categoria"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Ordem de exibição</FormLabel>
              <NumberInput
                value={formData.order}
                onChange={handleNumberChange}
                min={0}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Ativa</FormLabel>
              <Switch
                isChecked={formData.isActive}
                onChange={handleSwitchChange}
              />
            </FormControl>
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
              Excluir Categoria
            </AlertDialogHeader>
            <AlertDialogBody>
              Tem certeza que deseja excluir a categoria "{selectedCategory?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
};

export default Categories; 