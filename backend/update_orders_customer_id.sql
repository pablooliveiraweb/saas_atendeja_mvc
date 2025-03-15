-- Script para atualizar os pedidos existentes com o customerId correto
-- Este script busca clientes pelo número de telefone e atualiza os pedidos correspondentes

-- Atualizar pedidos que têm customerPhone mas não têm customerId
UPDATE orders o
SET customer_id = c.id
FROM customers c
WHERE o."customerPhone" = c.phone
AND o.restaurant_id = c.restaurant_id
AND o.customer_id IS NULL
AND o."customerPhone" IS NOT NULL; 