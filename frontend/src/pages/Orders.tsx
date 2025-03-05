import React from 'react';
import Layout from '../components/Layout';

const Orders: React.FC = () => {
  return (
    <Layout title="Pedidos">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Lista de Pedidos</h2>
        <p className="text-gray-600">
          Esta página está em desenvolvimento. Aqui você poderá visualizar e gerenciar os pedidos do seu restaurante.
        </p>
      </div>
    </Layout>
  );
};

export default Orders;
