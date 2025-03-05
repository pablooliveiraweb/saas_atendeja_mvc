import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Flex,
  Text,
  VStack,
  Button,
  HStack,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  ViewIcon,
  StarIcon,
  SettingsIcon,
  UnlockIcon,
} from '@chakra-ui/icons';

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  
  const isActive = (path: string) => {
    return pathname === path || pathname === path + '/';
  };

  return (
    <Box
      h="100vh"
      w="64"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
    >
      <Flex direction="column" h="full">
        <Flex
          direction="column"
          align="center"
          p={4}
          borderBottom="1px"
          borderColor="gray.200"
        >
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            Atende
          </Text>
          {user && (
            <Text mt={2} fontSize="sm" color="gray.600">
              {user.name}
            </Text>
          )}
        </Flex>

        <VStack flex="1" p={4} spacing={1} align="stretch">
          <Link to="/dashboard">
            <Button
              w="full"
              justifyContent="flex-start"
              variant="ghost"
              bg={isActive('/dashboard') ? "blue.50" : "transparent"}
              color={isActive('/dashboard') ? "blue.600" : "gray.600"}
              _hover={{ bg: "gray.50" }}
              borderRadius="md"
              py={3}
            >
              <HStack spacing={2} align="center">
                <HamburgerIcon boxSize={4} />
                <Text>Dashboard</Text>
              </HStack>
            </Button>
          </Link>
          
          <Link to="/categories">
            <Button
              w="full"
              justifyContent="flex-start"
              variant="ghost"
              bg={isActive('/categories') ? "blue.50" : "transparent"}
              color={isActive('/categories') ? "blue.600" : "gray.600"}
              _hover={{ bg: "gray.50" }}
              borderRadius="md"
              py={3}
            >
              <HStack spacing={2} align="center">
                <ViewIcon boxSize={4} />
                <Text>Categorias</Text>
              </HStack>
            </Button>
          </Link>
          
          <Link to="/products">
            <Button
              w="full"
              justifyContent="flex-start"
              variant="ghost"
              bg={isActive('/products') ? "blue.50" : "transparent"}
              color={isActive('/products') ? "blue.600" : "gray.600"}
              _hover={{ bg: "gray.50" }}
              borderRadius="md"
              py={3}
            >
              <HStack spacing={2} align="center">
                <StarIcon boxSize={4} />
                <Text>Produtos</Text>
              </HStack>
            </Button>
          </Link>
          
          <Link to="/settings">
            <Button
              w="full"
              justifyContent="flex-start"
              variant="ghost"
              bg={isActive('/settings') ? "blue.50" : "transparent"}
              color={isActive('/settings') ? "blue.600" : "gray.600"}
              _hover={{ bg: "gray.50" }}
              borderRadius="md"
              py={3}
            >
              <HStack spacing={2} align="center">
                <SettingsIcon boxSize={4} />
                <Text>Configurações</Text>
              </HStack>
            </Button>
          </Link>
        </VStack>

        <Box p={4} borderTop="1px" borderColor="gray.200">
          <Button
            w="full"
            justifyContent="flex-start"
            variant="ghost"
            color="gray.600"
            _hover={{ bg: "gray.50" }}
            borderRadius="md"
            py={3}
            onClick={logout}
          >
            <HStack spacing={2} align="center">
              <UnlockIcon boxSize={4} />
              <Text>Sair</Text>
            </HStack>
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default Sidebar; 