import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Box, Flex, Heading, IconButton, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex h="100vh" overflow="hidden" bg="gray.100">
      {/* Sidebar para desktop */}
      <Box display={{ base: 'none', md: 'block' }}>
        <Sidebar />
      </Box>

      {/* Sidebar mobile */}
      {isOpen && (
        <Box position="fixed" inset="0" zIndex="40" display={{ md: 'none' }}>
          <Box 
            position="fixed" 
            inset="0" 
            bg="blackAlpha.600" 
            onClick={onClose}
          />
          <Box 
            position="fixed" 
            insetY="0" 
            left="0" 
            display="flex" 
            flexDir="column" 
            zIndex="40" 
            w="full" 
            maxW="xs" 
            bg="white"
          >
            <Sidebar />
          </Box>
        </Box>
      )}

      {/* Conteúdo principal */}
      <Flex flexDir="column" flex="1" w="0" overflow="hidden">
        <Flex 
          align="center" 
          justify="space-between" 
          p={{ base: 4, md: 6 }} 
          borderBottom="1px" 
          borderColor="gray.200" 
          bg="white"
        >
          <Flex align="center">
            <IconButton
              aria-label="Abrir menu"
              icon={<HamburgerIcon />}
              onClick={onOpen}
              display={{ base: 'flex', md: 'none' }}
              variant="ghost"
              color="gray.500"
            />
            <Heading 
              ml={{ base: 2, md: 0 }} 
              fontSize={{ base: "lg", md: "xl" }} 
              fontWeight="semibold" 
              color="gray.800"
            >
              {title}
            </Heading>
          </Flex>
        </Flex>

        <Box flex="1" overflow="auto" p={{ base: 4, md: 6 }}>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout; 