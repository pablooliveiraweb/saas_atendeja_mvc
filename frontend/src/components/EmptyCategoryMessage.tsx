import React from 'react';
import { Box, Text, Icon, Flex, useColorModeValue } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

interface EmptyCategoryMessageProps {
  message?: string;
}

const EmptyCategoryMessage: React.FC<EmptyCategoryMessageProps> = ({ 
  message = 'Nenhum produto disponível nesta categoria.' 
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      bg={bgColor}
      p={8}
      borderRadius="lg"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor={textColor}
    >
      <Icon as={InfoIcon} boxSize={8} color={textColor} mb={4} />
      <Text color={textColor} textAlign="center">
        {message}
      </Text>
    </Flex>
  );
};

export default EmptyCategoryMessage; 