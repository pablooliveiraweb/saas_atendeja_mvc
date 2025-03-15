import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Box, Flex, Heading } from '@chakra-ui/react';
import OrderNotification from './OrderNotification';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  return (
    <Flex h="100vh">
      <Sidebar />
      <Box flex="1" p={5} overflowY="auto">
        {title && <Heading size="lg" mb={6}>{title}</Heading>}
        <OrderNotification />
        {children}
      </Box>
    </Flex>
  );
};

export default AdminLayout; 