import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirecionar se já estiver autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Atende</h1>
            <p className="text-gray-600 text-lg">Gestão de Restaurantes e Delivery</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2 text-lg">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2 text-lg">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="Sua senha"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 text-lg font-medium transition-colors duration-200"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-gray-600">
            <p>Não possui uma conta? Entre em contato com nosso suporte.</p>
          </div>
        </div>
      </div>
      
      {/* Lado direito - Imagem */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="text-white max-w-lg">
            <h2 className="text-4xl font-bold mb-6">Gerencie seu restaurante com facilidade</h2>
            <p className="text-xl mb-8">
              Controle pedidos, cardápios e entregas em uma única plataforma intuitiva.
            </p>
            <div className="flex justify-center">
              <img 
                src="https://img.freepik.com/free-vector/food-delivery-service-abstract-concept-illustration_335657-3966.jpg" 
                alt="Ilustração de restaurante" 
                className="w-full max-w-md rounded-lg shadow-2xl"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 