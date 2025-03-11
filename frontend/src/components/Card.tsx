import React, { ReactNode } from 'react';
import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';

interface CardProps extends BoxProps {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, ...rest }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box 
      p={6} 
      bg={bgColor} 
      borderRadius="md" 
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Card; 