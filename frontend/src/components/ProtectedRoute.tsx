import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Flex, Spinner } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(isAuthenticated);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && !loading) {
        setIsChecking(true);
        try {
          // Tentar verificar a autenticação
          const isValid = await checkAuth();
          setIsAuthorized(isValid);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          setIsAuthorized(false);
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsAuthorized(isAuthenticated);
      }
    };

    verifyAuth();
  }, [isAuthenticated, loading, checkAuth]);

  if (loading || isChecking) {
    // Exibir um loading enquanto verifica a autenticação
    return (
      <Flex align="center" justify="center" minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!isAuthorized) {
    console.log('Redirecionando para /login a partir de:', location.pathname);
    return <Navigate to="/login" />;
  }

  // Renderizar o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute; 