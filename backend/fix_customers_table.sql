-- Remover trigger existente
DROP TRIGGER IF EXISTS update_customer_stats_trigger ON orders;
DROP FUNCTION IF EXISTS update_customer_stats();

-- Recriar tabela customers com o case correto nas colunas
DROP TABLE IF EXISTS customers CASCADE;

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) DEFAULT 'Cliente sem nome',
    email VARCHAR(255) DEFAULT 'email@exemplo.com',
    phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    document VARCHAR(20),
    restaurant_id UUID REFERENCES restaurants(id),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_order_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar a função do trigger corrigida
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers
    SET 
        total_orders = COALESCE(customers.total_orders, 0) + 1,
        total_spent = COALESCE(customers.total_spent, 0) + NEW.total,
        last_order_at = NEW."createdAt"
    WHERE id = NEW."customerId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats(); 