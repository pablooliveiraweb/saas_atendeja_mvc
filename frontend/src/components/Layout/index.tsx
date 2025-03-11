import React, { ReactNode } from 'react';
import Sidebar from '../Sidebar';
import { Box, Flex, Heading } from '@chakra-ui/react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <Flex h="100vh">
      <Sidebar />
      <Box flex="1" p={5} overflowY="auto">
        {title && <Heading size="lg" mb={6}>{title}</Heading>}
        {children}
      </Box>
    </Flex>
  );
};

export default Layout; 