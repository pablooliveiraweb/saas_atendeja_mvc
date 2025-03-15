-- Recriar tabela orders com o case correto nas colunas
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'cash',
    order_type VARCHAR(50) DEFAULT 'pickup',
    subtotal DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    is_paid BOOLEAN DEFAULT false,
    delivery_address TEXT,
    delivery_zip_code VARCHAR(8),
    customer_phone VARCHAR(20),
    customer_name VARCHAR(255),
    restaurant_id UUID REFERENCES restaurants(id),
    customer_id UUID REFERENCES customers(id),
    notification_sent BOOLEAN DEFAULT false,
    printed BOOLEAN DEFAULT false,
    coupon_code VARCHAR(50),
    coupon_id UUID REFERENCES coupons(id),
    discount_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 