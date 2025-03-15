import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Link,
  Stack,
  Divider,
  Button,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  ViewIcon,
  StarIcon,
  SettingsIcon,
  UnlockIcon,
  PhoneIcon,
  CalendarIcon,
  RepeatIcon,
} from '@chakra-ui/icons';
import { FiShoppingBag, FiTag } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

interface NavItemProps {
  icon: React.ReactElement;
  children: React.ReactNode;
  to: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to, isActive }) => {
  const activeBg = "blue.50";
  const inactiveBg = "white";
  const activeColor = "blue.500";
  const inactiveColor = "gray.600";

  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : inactiveBg}
        color={isActive ? activeColor : inactiveColor}
        _hover={{
          bg: activeBg,
          color: activeColor,
        }}
      >
        <HStack spacing={2}>
          {icon}
          {children}
        </HStack>
      </Flex>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { logout, restaurant } = useAuth();
  const location = useLocation();
  
  console.log('Current pathname:', location.pathname); // Debug line

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      h="100vh"
      w="64"
      bg="white"
      borderRight="1px"
      borderRightColor="gray.200"
      boxShadow="sm"
      zIndex="sticky"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Atende
        </Text>
      </Flex>

      {restaurant && (
        <Box px="8" mb="4">
          <Text fontSize="sm" color="gray.500">
            Restaurante
          </Text>
          <Text fontSize="md" fontWeight="medium">
            {restaurant.name}
          </Text>
        </Box>
      )}

      <Stack spacing={0} mt="4">
        <NavItem
          icon={<HamburgerIcon boxSize={4} />}
          to="/dashboard"
          isActive={location.pathname === '/dashboard'}
        >
          Dashboard
        </NavItem>
        <NavItem
          icon={<RepeatIcon boxSize={4} />}
          to="/orders"
          isActive={location.pathname.includes('/orders')}
        >
          Gerenciar Pedidos
        </NavItem>
        <NavItem
          icon={<PhoneIcon boxSize={4} />}
          to="/customers"
          isActive={location.pathname === '/customers'}
        >
          Clientes
        </NavItem>
        <NavItem
          icon={<ViewIcon boxSize={4} />}
          to="/categories"
          isActive={location.pathname === '/categories'}
        >
          Categorias
        </NavItem>
        <NavItem
          icon={<StarIcon boxSize={4} />}
          to="/products"
          isActive={location.pathname === '/products'}
        >
          Produtos
        </NavItem>
        <NavItem
          icon={<SettingsIcon boxSize={4} />}
          to="/settings"
          isActive={location.pathname === '/settings'}
        >
          Configurações
        </NavItem>
        <NavItem
          icon={<Icon as={FiTag} boxSize={4} />}
          to="/coupons"
          isActive={location.pathname === '/coupons'}
        >
          Cupons
        </NavItem>
      </Stack>

      <Box position="absolute" bottom="8" width="100%">
        <Divider mb="4" />
        <Flex px="8" justifyContent="center">
          <Button
            variant="ghost"
            onClick={logout}
            size="sm"
          >
            <HStack spacing={2}>
              <UnlockIcon boxSize={4} />
              <Text>Sair</Text>
            </HStack>
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default Sidebar; 