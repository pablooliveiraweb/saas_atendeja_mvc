import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useColorMode, IconButton, Flex, Box, Heading, useColorModeValue } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Cores que mudam com base no modo
  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const headerBgColor = useColorModeValue('white', 'gray.700');
  const headerBorderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mobileOverlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.800');

  return (
    <Flex h="100vh" overflow="hidden" bg={bgColor}>
      {/* Sidebar para desktop */}
      <Box display={{ base: 'none', md: 'block' }}>
        <Sidebar />
      </Box>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <Box position="fixed" inset="0" zIndex="40" display={{ md: 'none' }}>
          <Box 
            position="fixed" 
            inset="0" 
            bg={mobileOverlayBg} 
            onClick={() => setSidebarOpen(false)}
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
            bg={headerBgColor}
          >
            <Sidebar />
          </Box>
        </Box>
      )}

      {/* Conteúdo principal */}
      <Flex flexDir="column" flex="1" w="0" overflow="hidden">
        <Flex 
          alignItems="center" 
          justifyContent="space-between" 
          p={{ base: 4, md: 6 }} 
          borderBottom="1px" 
          borderColor={headerBorderColor}
          bg={headerBgColor}
        >
          <Flex alignItems="center">
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="Open sidebar"
              icon={<Bars3Icon style={{ width: '1.5rem', height: '1.5rem' }} />}
              onClick={() => setSidebarOpen(true)}
              variant="ghost"
              color="gray.500"
            />
            <Heading 
              ml={{ base: 2, md: 0 }} 
              fontSize={{ base: 'lg', md: 'xl' }} 
              fontWeight="semibold" 
              color={textColor}
            >
              {title}
            </Heading>
          </Flex>
          
          {/* Toggle de modo escuro */}
          <Flex alignItems="center">
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              variant="ghost"
              onClick={toggleColorMode}
              size="md"
            />
          </Flex>
        </Flex>

        <Box 
          as="main" 
          flex="1" 
          overflow="auto" 
          p={{ base: 4, md: 6 }}
          bg={bgColor}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout; 