import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  Flex,
  Button,
  Spinner,
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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Category, categoriesService, CreateCategoryData, UpdateCategoryData } from '../../services/categoriesService';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';

const Categories = () => {
  const { restaurant } = useAuth();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Modal para adicionar/editar categoria
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    order: 0,
    isActive: true,
  });
  
  // AlertDialog para confirmar exclusão
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar categorias',
        description: 'Não foi possível carregar as categorias. Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        order: categories.length,
        isActive: true,
      });
    }
    onOpen();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isActive: e.target.checked });
  };

  const handleNumberChange = (value: string) => {
    setFormData({ ...formData, order: parseInt(value) });
  };

  const handleSubmit = async () => {
    try {
      if (!restaurant) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar associado a um restaurante para criar categorias.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (selectedCategory) {
        // Atualizar categoria existente
        await categoriesService.update(selectedCategory.id, formData as UpdateCategoryData);
        toast({
          title: 'Categoria atualizada',
          description: 'A categoria foi atualizada com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Criar nova categoria
        await categoriesService.create(formData);
        toast({
          title: 'Categoria criada',
          description: 'A categoria foi criada com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
      loadCategories();
    } catch (error) {
      toast({
        title: 'Erro',
        description: selectedCategory 
          ? 'Não foi possível atualizar a categoria. Tente novamente.' 
          : 'Não foi possível criar a categoria. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleOpenDeleteAlert = (category: Category) => {
    setSelectedCategory(category);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (selectedCategory) {
        await categoriesService.delete(selectedCategory.id);
        toast({
          title: 'Categoria excluída',
          description: 'A categoria foi excluída com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadCategories();
      }
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a categoria. Verifique se não há produtos associados a ela.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAlertOpen(false);
    }
  };

  return (
    <Layout title="Categorias">
      <Container maxW="container.xl" py={8}>
        <Flex justify="space-between" align="center" mb={8}>
          <Heading size="lg">Categorias</Heading>
          <Button 
            colorScheme="blue" 
            onClick={() => handleOpenModal()}
            isDisabled={!restaurant}
          >
            <HStack spacing={2}>
              <AddIcon boxSize={3} />
              <Text>Nova Categoria</Text>
            </HStack>
          </Button>
        </Flex>

        {!restaurant && (
          <Box p={4} bg="yellow.100" mb={4} borderRadius="md">
            Você precisa estar associado a um restaurante para gerenciar categorias.
          </Box>
        )}

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Descrição</Th>
              <Th>Ordem</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {categories.map((category) => (
              <Tr key={category.id}>
                <Td>{category.name}</Td>
                <Td>{category.description}</Td>
                <Td>{category.order}</Td>
                <Td>{category.isActive ? 'Ativo' : 'Inativo'}</Td>
                <Td>
                  <IconButton
                    aria-label="Editar categoria"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleOpenModal(category)}
                    isDisabled={!restaurant}
                  />
                  <IconButton
                    aria-label="Excluir categoria"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleOpenDeleteAlert(category)}
                    isDisabled={!restaurant}
                  />
                </Td>
              </Tr>
            ))}
            {categories.length === 0 && !isLoading && (
              <Tr>
                <Td colSpan={5} textAlign="center">
                  Nenhuma categoria encontrada
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>

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
                <FormLabel>Ordem</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.order}
                  onChange={handleNumberChange}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isActive" mb="0">
                  Ativo
                </FormLabel>
                <Switch
                  id="isActive"
                  name="isActive"
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
                {selectedCategory ? 'Atualizar' : 'Criar'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* AlertDialog para confirmar exclusão */}
        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsAlertOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Excluir Categoria
              </AlertDialogHeader>
              <AlertDialogBody>
                Tem certeza que deseja excluir a categoria "{selectedCategory?.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={handleDelete} ml={3}>
                  Excluir
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Layout>
  );
};

export default Categories; 