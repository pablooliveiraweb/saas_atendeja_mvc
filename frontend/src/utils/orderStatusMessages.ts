export const getStatusMessage = (status: string, orderId: string, restaurantName: string): string => {
  const messages = {
    ready: `🎉 Ótimas notícias! Seu pedido #${orderId} está pronto para retirada no ${restaurantName}. Agradecemos a preferência!`,
    delivered: `✅ Pedido #${orderId} entregue! O ${restaurantName} agradece a sua preferência. Esperamos que tenha gostado!`,
    delivering: `🚚 Seu pedido #${orderId} saiu para entrega! Em breve chegará até você.`,
    preparing: `👨‍🍳 Seu pedido #${orderId} está sendo preparado com todo carinho pela equipe do ${restaurantName}.`,
    confirmed: `✨ Seu pedido #${orderId} foi confirmado pelo ${restaurantName} e já está sendo preparado!`,
    cancelled: `❌ Lamentamos, mas seu pedido #${orderId} foi cancelado. Por favor, entre em contato com ${restaurantName} para mais informações.`
  };

  return messages[status as keyof typeof messages] || '';
};