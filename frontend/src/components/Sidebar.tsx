import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Flex,
  Text,
  VStack,
  Button,
  HStack,
  Tooltip,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  ViewIcon,
  StarIcon,
  SettingsIcon,
  UnlockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Cores para modo claro/escuro
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const logoColor = useColorModeValue('blue.600', 'blue.300');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const activeTextColor = useColorModeValue('blue.600', 'blue.300');
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Box
      h="100vh"
      w={isCollapsed ? "16" : "64"}
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      transition="width 0.3s ease"
      position="relative"
    >
      <IconButton
        aria-label="Toggle sidebar"
        icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        size="sm"
        position="absolute"
        right="-3"
        top="4"
        zIndex="2"
        borderRadius="full"
        bg={bgColor}
        shadow="md"
        onClick={toggleSidebar}
      />
      <Flex direction="column" h="full">
        <Flex
          direction="column"
          align={isCollapsed ? "center" : "center"}
          p={4}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <Text fontSize="xl" fontWeight="bold" color={logoColor}>
            {isCollapsed ? "A" : "Atende"}
          </Text>
          {user && !isCollapsed && (
            <Text mt={2} fontSize="sm" color={textColor}>
              {user.name}
            </Text>
          )}
        </Flex>

        <VStack flex="1" p={4} spacing={1} align="stretch">
          <Tooltip label="Dashboard" placement="right" isDisabled={!isCollapsed}>
            <RouterLink to="/dashboard">
              <Button
                w="full"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                variant="ghost"
                bg={isActive('/dashboard') ? activeBgColor : "transparent"}
                color={isActive('/dashboard') ? activeTextColor : textColor}
                _hover={{ bg: hoverBgColor }}
                borderRadius="md"
                py={3}
              >
                <HStack spacing={2} align="center">
                  <HamburgerIcon boxSize={4} />
                  {!isCollapsed && <Text>Dashboard</Text>}
                </HStack>
              </Button>
            </RouterLink>
          </Tooltip>
          
          <Tooltip label="Categorias" placement="right" isDisabled={!isCollapsed}>
            <RouterLink to="/categories">
              <Button
                w="full"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                variant="ghost"
                bg={isActive('/categories') ? activeBgColor : "transparent"}
                color={isActive('/categories') ? activeTextColor : textColor}
                _hover={{ bg: hoverBgColor }}
                borderRadius="md"
                py={3}
              >
                <HStack spacing={2} align="center">
                  <ViewIcon boxSize={4} />
                  {!isCollapsed && <Text>Categorias</Text>}
                </HStack>
              </Button>
            </RouterLink>
          </Tooltip>
          
          <Tooltip label="Produtos" placement="right" isDisabled={!isCollapsed}>
            <RouterLink to="/products">
              <Button
                w="full"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                variant="ghost"
                bg={isActive('/products') ? activeBgColor : "transparent"}
                color={isActive('/products') ? activeTextColor : textColor}
                _hover={{ bg: hoverBgColor }}
                borderRadius="md"
                py={3}
              >
                <HStack spacing={2} align="center">
                  <StarIcon boxSize={4} />
                  {!isCollapsed && <Text>Produtos</Text>}
                </HStack>
              </Button>
            </RouterLink>
          </Tooltip>

          <Tooltip label="Clientes" placement="right" isDisabled={!isCollapsed}>
            <RouterLink to="/customers">
              <Button
                w="full"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                variant="ghost"
                bg={isActive('/customers') ? activeBgColor : "transparent"}
                color={isActive('/customers') ? activeTextColor : textColor}
                _hover={{ bg: hoverBgColor }}
                borderRadius="md"
                py={3}
              >
                <HStack spacing={2} align="center">
                  <UserGroupIcon style={{ width: '1em', height: '1em' }} />
                  {!isCollapsed && <Text>Clientes</Text>}
                </HStack>
              </Button>
            </RouterLink>
          </Tooltip>
          
          <Tooltip label="Configurações" placement="right" isDisabled={!isCollapsed}>
            <RouterLink to="/settings">
              <Button
                w="full"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                variant="ghost"
                bg={isActive('/settings') ? activeBgColor : "transparent"}
                color={isActive('/settings') ? activeTextColor : textColor}
                _hover={{ bg: hoverBgColor }}
                borderRadius="md"
                py={3}
              >
                <HStack spacing={2} align="center">
                  <SettingsIcon boxSize={4} />
                  {!isCollapsed && <Text>Configurações</Text>}
                </HStack>
              </Button>
            </RouterLink>
          </Tooltip>
        </VStack>

        <Box p={4} borderTop="1px" borderColor={borderColor}>
          <Tooltip label="Sair" placement="right" isDisabled={!isCollapsed}>
            <Button
              w="full"
              justifyContent={isCollapsed ? "center" : "flex-start"}
              variant="ghost"
              color={textColor}
              _hover={{ bg: hoverBgColor }}
              borderRadius="md"
              py={3}
              onClick={logout}
            >
              <HStack spacing={2} align="center">
                <UnlockIcon boxSize={4} />
                {!isCollapsed && <Text>Sair</Text>}
              </HStack>
            </Button>
          </Tooltip>
        </Box>
      </Flex>
    </Box>
  );
};

export default Sidebar; 