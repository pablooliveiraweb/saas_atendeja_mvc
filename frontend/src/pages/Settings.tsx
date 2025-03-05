import React from 'react';
import Layout from '../components/Layout';

const Settings: React.FC = () => {
  return (
    <Layout title="Configurações">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Configurações do Restaurante</h2>
        <p className="text-gray-600">
          Esta página está em desenvolvimento. Aqui você poderá configurar as informações do seu restaurante, 
          horários de funcionamento, métodos de pagamento e outras configurações.
        </p>
      </div>
    </Layout>
  );
};

export default Settings;
