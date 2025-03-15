import React, { useState, useEffect, useRef, RefObject } from 'react';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Flex,
  Spacer,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  FormHelperText,
  useToast,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogProps,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import couponService, { Coupon, CreateCouponDto, UpdateCouponDto } from '../../services/couponService';

// Vamos substituir o date-fns por funções simples de formatação de data
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '-';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('pt-BR');
};

// Função para formatar data para o input type="date"
const formatDateForInput = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Formato YYYY-MM-DD para input type="date"
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const Coupons: React.FC = () => {
  const { restaurant } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CreateCouponDto | UpdateCouponDto>({
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    isActive: true,
    minOrderValue: undefined,
    maxUsage: undefined,
    expiresAt: undefined,
    restaurantId: restaurant?.id || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  // Modal para adicionar/editar cupom
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // AlertDialog para confirmar exclusão
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null) as RefObject<HTMLButtonElement>;

  // Carregar cupons
  useEffect(() => {
    if (restaurant?.id) {
      loadCoupons();
    }
  }, [restaurant]);

  const loadCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await couponService.getCoupons(restaurant?.id || '');
      setCoupons(data);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      toast({
        title: 'Erro ao carregar cupons',
        description: 'Não foi possível carregar a lista de cupons.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir modal para adicionar novo cupom
  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: 0,
      isActive: true,
      minOrderValue: undefined,
      maxUsage: undefined,
      expiresAt: undefined,
      restaurantId: restaurant?.id || '',
    });
    onOpen();
  };

  // Abrir modal para editar cupom existente
  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      isActive: coupon.isActive,
      minOrderValue: coupon.minOrderValue,
      maxUsage: coupon.maxUsage,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : undefined,
      restaurantId: coupon.restaurantId,
    });
    onOpen();
  };

  // Abrir diálogo de confirmação para excluir cupom
  const handleDeleteClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteAlertOpen(true);
  };

  // Excluir cupom
  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;
    
    try {
      setIsSubmitting(true);
      await couponService.deleteCoupon(selectedCoupon.id);
      toast({
        title: 'Cupom excluído',
        description: 'O cupom foi excluído com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadCoupons();
    } catch (error) {
      console.error('Erro ao excluir cupom:', error);
      toast({
        title: 'Erro ao excluir cupom',
        description: 'Não foi possível excluir o cupom.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteAlertOpen(false);
    }
  };

  // Atualizar dados do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Atualizar valor numérico
  const handleNumberInputChange = (name: string, value: number) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Atualizar data de expiração
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value ? new Date(value) : undefined,
    });
  };

  // Atualizar status do cupom (ativo/inativo)
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      isActive: e.target.checked,
    });
  };

  // Salvar cupom (criar ou atualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (selectedCoupon) {
        // Atualizar cupom existente
        await couponService.updateCoupon(selectedCoupon.id, formData as UpdateCouponDto);
        toast({
          title: 'Cupom atualizado',
          description: 'O cupom foi atualizado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Criar novo cupom
        await couponService.createCoupon(formData as CreateCouponDto);
        toast({
          title: 'Cupom criado',
          description: 'O cupom foi criado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      onClose();
      loadCoupons();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      toast({
        title: 'Erro ao salvar cupom',
        description: 'Não foi possível salvar o cupom.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Flex align="center" mb={6}>
        <Heading size="lg">Gerenciar Cupons</Heading>
        <Spacer />
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddCoupon}
        >
          Novo Cupom
        </Button>
      </Flex>

      <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
        {isLoading ? (
          <Flex justify="center" align="center" p={10}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : coupons.length === 0 ? (
          <Box p={10} textAlign="center">
            <Text fontSize="lg" color="gray.500">
              Nenhum cupom encontrado. Clique em "Novo Cupom" para criar o primeiro.
            </Text>
          </Box>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Código</Th>
                <Th>Tipo</Th>
                <Th>Valor</Th>
                <Th>Status</Th>
                <Th>Validade</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {coupons.map((coupon) => (
                <Tr key={coupon.id}>
                  <Td>{coupon.code}</Td>
                  <Td>{coupon.type === 'percentage' ? 'Percentual' : 'Valor Fixo'}</Td>
                  <Td>
                    {coupon.type === 'percentage' 
                      ? `${coupon.value}%` 
                      : `R$ ${coupon.value.toFixed(2)}`}
                  </Td>
                  <Td>
                    <Badge colorScheme={coupon.isActive ? 'green' : 'red'}>
                      {coupon.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td>{formatDate(coupon.expiresAt)}</Td>
                  <Td>
                    <IconButton
                      aria-label="Editar cupom"
                      icon={<EditIcon />}
                      size="sm"
                      mr={2}
                      onClick={() => handleEditCoupon(coupon)}
                    />
                    <IconButton
                      aria-label="Excluir cupom"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteClick(coupon)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modal para adicionar/editar cupom */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {selectedCoupon ? 'Editar Cupom' : 'Novo Cupom'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl mb={4} isRequired>
                <FormLabel>Código</FormLabel>
                <Input
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Ex: BEMVINDO10"
                />
                <FormHelperText>
                  Código que o cliente usará para aplicar o cupom
                </FormHelperText>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Descrição</FormLabel>
                <Input
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: Cupom de boas-vindas"
                />
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Tipo</FormLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </Select>
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Valor</FormLabel>
                <NumberInput
                  min={0}
                  max={formData.type === 'percentage' ? 100 : 1000}
                  value={formData.value}
                  onChange={(_, value) => handleNumberInputChange('value', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  {formData.type === 'percentage' 
                    ? 'Porcentagem de desconto (0-100%)' 
                    : 'Valor fixo de desconto em reais'}
                </FormHelperText>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Valor mínimo do pedido</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.minOrderValue || ''}
                  onChange={(_, value) => handleNumberInputChange('minOrderValue', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Valor mínimo do pedido para que o cupom seja válido (opcional)
                </FormHelperText>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Limite de uso</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.maxUsage || ''}
                  onChange={(_, value) => handleNumberInputChange('maxUsage', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Número máximo de vezes que o cupom pode ser usado (opcional)
                </FormHelperText>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Data de expiração</FormLabel>
                <Input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt ? formatDateForInput(formData.expiresAt) : ''}
                  onChange={handleDateChange}
                />
                <FormHelperText>
                  Data em que o cupom expira (opcional)
                </FormHelperText>
              </FormControl>

              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel htmlFor="isActive" mb="0">
                  Cupom ativo
                </FormLabel>
                <Switch
                  id="isActive"
                  isChecked={formData.isActive}
                  onChange={handleSwitchChange}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                type="submit"
                isLoading={isSubmitting}
              >
                Salvar
              </Button>
              <Button onClick={onClose}>Cancelar</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* AlertDialog para confirmar exclusão */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef as any}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Cupom
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir o cupom "{selectedCoupon?.code}"? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancelar
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDeleteCoupon} 
                ml={3}
                isLoading={isSubmitting}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default Coupons; 