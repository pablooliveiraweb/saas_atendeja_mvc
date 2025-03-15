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
  Collapse,
  Icon,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  ViewIcon,
  StarIcon,
  SettingsIcon,
  UnlockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@chakra-ui/icons';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { FaClipboardList, FaWhatsapp, FaStore, FaTicketAlt } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Cores para modo claro/escuro
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const logoColor = useColorModeValue('blue.600', 'blue.300');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const activeTextColor = useColorModeValue('blue.600', 'blue.300');
  const submenuBgColor = useColorModeValue('gray.50', 'gray.750');
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Fechar o submenu de configurações quando colapsar a sidebar
    if (!isCollapsed) {
      setIsSettingsOpen(false);
    }
  };
  
  const toggleSettingsMenu = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  const isSettingsActive = () => {
    return pathname.startsWith('/settings');
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
          
          <Tooltip label="Pedidos" placement="right" isDisabled={!isCollapsed}>
            <RouterLink to="/orders">
              <Button
                w="full"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                variant="ghost"
                bg={isActive('/orders') ? activeBgColor : "transparent"}
                color={isActive('/orders') ? activeTextColor : textColor}
                _hover={{ bg: hoverBgColor }}
                borderRadius="md"
                py={3}
              >
                <HStack spacing={2} align="center">
                  <Icon as={FaClipboardList} boxSize={4} />
                  {!isCollapsed && <Text>Pedidos</Text>}
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
          
          <Tooltip label="Cupons" placement="right" isDisabled={!isCollapsed}>
            <RouterLink to="/coupons">
              <Button
                w="full"
                justifyContent={isCollapsed ? "center" : "flex-start"}
                variant="ghost"
                bg={isActive('/coupons') ? activeBgColor : "transparent"}
                color={isActive('/coupons') ? activeTextColor : textColor}
                _hover={{ bg: hoverBgColor }}
                borderRadius="md"
                py={3}
              >
                <HStack spacing={2} align="center">
                  <Icon as={FaTicketAlt} boxSize={4} />
                  {!isCollapsed && <Text>Cupons</Text>}
                </HStack>
              </Button>
            </RouterLink>
          </Tooltip>
          
          <Box>
            <Tooltip label="Configurações" placement="right" isDisabled={!isCollapsed}>
              <Button
                w="full"
                justifyContent={isCollapsed ? "center" : "space-between"}
                variant="ghost"
                bg={isSettingsActive() ? activeBgColor : "transparent"}
                color={isSettingsActive() ? activeTextColor : textColor}
                _hover={{ bg: hoverBgColor }}
                borderRadius="md"
                py={3}
                onClick={isCollapsed ? undefined : toggleSettingsMenu}
                as={isCollapsed ? RouterLink : undefined}
                to={isCollapsed ? "/settings" : undefined}
              >
                <HStack spacing={2} align="center">
                  <SettingsIcon boxSize={4} />
                  {!isCollapsed && <Text>Configurações</Text>}
                </HStack>
                {!isCollapsed && (
                  <Icon 
                    as={isSettingsOpen ? ChevronUpIcon : ChevronDownIcon} 
                    boxSize={4} 
                  />
                )}
              </Button>
            </Tooltip>
            
            {!isCollapsed && (
              <Collapse in={isSettingsOpen} animateOpacity>
                <VStack 
                  spacing={1} 
                  align="stretch" 
                  pl={6} 
                  mt={1} 
                  bg={submenuBgColor} 
                  borderRadius="md"
                >
                  <RouterLink to="/settings">
                    <Button
                      w="full"
                      justifyContent="flex-start"
                      variant="ghost"
                      bg={isActive('/settings') ? activeBgColor : "transparent"}
                      color={isActive('/settings') ? activeTextColor : textColor}
                      _hover={{ bg: hoverBgColor }}
                      borderRadius="md"
                      py={2}
                      size="sm"
                    >
                      <HStack spacing={2} align="center">
                        <SettingsIcon boxSize={3} />
                        <Text fontSize="sm">Geral</Text>
                      </HStack>
                    </Button>
                  </RouterLink>
                  
                  <RouterLink to="/settings/whatsapp">
                    <Button
                      w="full"
                      justifyContent="flex-start"
                      variant="ghost"
                      bg={isActive('/settings/whatsapp') ? activeBgColor : "transparent"}
                      color={isActive('/settings/whatsapp') ? activeTextColor : textColor}
                      _hover={{ bg: hoverBgColor }}
                      borderRadius="md"
                      py={2}
                      size="sm"
                    >
                      <HStack spacing={2} align="center">
                        <Icon as={FaWhatsapp} boxSize={3} />
                        <Text fontSize="sm">WhatsApp</Text>
                      </HStack>
                    </Button>
                  </RouterLink>
                  
                  <RouterLink to="/settings/restaurant">
                    <Button
                      w="full"
                      justifyContent="flex-start"
                      variant="ghost"
                      bg={isActive('/settings/restaurant') ? activeBgColor : "transparent"}
                      color={isActive('/settings/restaurant') ? activeTextColor : textColor}
                      _hover={{ bg: hoverBgColor }}
                      borderRadius="md"
                      py={2}
                      size="sm"
                    >
                      <HStack spacing={2} align="center">
                        <Icon as={FaStore} boxSize={3} />
                        <Text fontSize="sm">Restaurante</Text>
                      </HStack>
                    </Button>
                  </RouterLink>
                </VStack>
              </Collapse>
            )}
          </Box>
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