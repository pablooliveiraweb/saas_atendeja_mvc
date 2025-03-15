import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
  Divider,
  Alert,
  AlertIcon,
  Heading,
  Badge,
  VStack,
  Flex
} from '@chakra-ui/react';
import { OptionGroup, Option, SelectedOption } from '../types/product';

interface ProductOptionsSelectorProps {
  optionGroups: OptionGroup[];
  onOptionsChange: (selectedOptions: SelectedOption[]) => void;
}

const ProductOptionsSelector: React.FC<ProductOptionsSelectorProps> = ({ 
  optionGroups, 
  onOptionsChange 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  
  // Efeito para depuração
  useEffect(() => {
    console.log('ProductOptionsSelector recebeu grupos:', optionGroups);
  }, [optionGroups]);

  // Função para lidar com a seleção de opção única (radio)
  const handleSingleOptionChange = (groupName: string, option: Option) => {
    // Remover qualquer opção anterior do mesmo grupo
    const filteredOptions = selectedOptions.filter(
      selected => selected.groupName !== groupName
    );
    
    // Adicionar a nova opção selecionada
    const newSelectedOptions = [...filteredOptions, { groupName, option }];
    setSelectedOptions(newSelectedOptions);
    onOptionsChange(newSelectedOptions);
  };

  // Função para lidar com a seleção de múltiplas opções (checkbox)
  const handleMultipleOptionChange = (groupName: string, option: Option, isChecked: boolean) => {
    let newSelectedOptions;
    
    if (isChecked) {
      // Adicionar a opção selecionada
      newSelectedOptions = [...selectedOptions, { groupName, option }];
    } else {
      // Remover a opção desmarcada
      newSelectedOptions = selectedOptions.filter(
        selected => !(selected.groupName === groupName && selected.option.name === option.name)
      );
    }
    
    setSelectedOptions(newSelectedOptions);
    onOptionsChange(newSelectedOptions);
  };

  // Verificar se uma opção está selecionada (para checkbox)
  const isOptionSelected = (groupName: string, optionName: string) => {
    return selectedOptions.some(
      selected => selected.groupName === groupName && selected.option.name === optionName
    );
  };

  // Obter a opção selecionada para um grupo (para radio)
  const getSelectedOption = (groupName: string) => {
    const selected = selectedOptions.find(selected => selected.groupName === groupName);
    return selected ? selected.option.name : "";
  };

  // Calcular o preço adicional para exibição
  const formatAdditionalPrice = (price: number) => {
    return price > 0 ? `+R$ ${price.toFixed(2)}` : '';
  };

  if (!optionGroups || optionGroups.length === 0) {
    return (
      <Box mt={4} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
        <Text color="gray.500" fontSize="sm">
          Este produto não possui complementos disponíveis.
        </Text>
      </Box>
    );
  }

  return (
    <VStack mt={4} spacing={4} align="stretch">
      <Box borderWidth="1px" borderRadius="md" borderColor="blue.200" p={4} bg="blue.50">
        <Heading size="md" mb={3} color="blue.600">Complementos</Heading>
        <Text fontSize="sm" color="gray.600">
          Selecione os complementos para personalizar seu produto.
          Os itens marcados como <Badge colorScheme="red" ml={1} mr={1}>Obrigatório</Badge> 
          devem ser escolhidos antes de adicionar à sacola.
        </Text>
      </Box>

      {optionGroups.map((group, index) => (
        <Box 
          key={index} 
          mb={4} 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          borderColor={group.required ? "red.200" : "gray.200"}
          bg={group.required ? "red.50" : "white"}
          boxShadow="sm"
        >
          <FormControl isRequired={group.required}>
            <FormLabel 
              display="flex" 
              alignItems="center" 
              color={group.required ? "red.700" : "gray.700"}
              fontWeight="bold"
            >
              {group.name}
              {group.required && (
                <Badge ml={2} colorScheme="red" fontSize="10px" py={0.5}>Obrigatório</Badge>
              )}
              {group.multiple && (
                <Badge ml={2} colorScheme="blue" fontSize="10px" py={0.5}>Múltipla escolha</Badge>
              )}
            </FormLabel>

            {group.required && !getSelectedOption(group.name) && (
              <Alert status="warning" mb={3} size="sm" borderRadius="md" variant="left-accent">
                <AlertIcon boxSize="16px" />
                <Text fontSize="sm">Selecione uma opção</Text>
              </Alert>
            )}

            {group.multiple ? (
              <CheckboxGroup>
                <Stack direction="column" spacing={2}>
                  {group.options.map((option, optionIndex) => (
                    <Checkbox
                      key={optionIndex}
                      isChecked={isOptionSelected(group.name, option.name)}
                      onChange={(e) => handleMultipleOptionChange(group.name, option, e.target.checked)}
                      colorScheme="blue"
                      size="md"
                    >
                      <Flex justify="space-between" width="100%" alignItems="center">
                        <Text>{option.name}</Text>
                        {option.price > 0 && (
                          <Badge colorScheme="green" ml={2} fontSize="10px" py={0.5}>
                            {formatAdditionalPrice(option.price)}
                          </Badge>
                        )}
                      </Flex>
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            ) : (
              <RadioGroup 
                value={getSelectedOption(group.name)}
                onChange={(value) => {
                  const option = group.options.find(opt => opt.name === value);
                  if (option) {
                    handleSingleOptionChange(group.name, option);
                  }
                }}
                colorScheme="blue"
              >
                <Stack direction="column" spacing={3}>
                  {group.options.map((option, optionIndex) => (
                    <Radio key={optionIndex} value={option.name} size="md">
                      <Flex justify="space-between" width="100%" alignItems="center">
                        <Text>{option.name}</Text>
                        {option.price > 0 && (
                          <Badge colorScheme="green" ml={2} fontSize="10px" py={0.5}>
                            {formatAdditionalPrice(option.price)}
                          </Badge>
                        )}
                      </Flex>
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            )}
          </FormControl>
        </Box>
      ))}
    </VStack>
  );
};

export default ProductOptionsSelector; 