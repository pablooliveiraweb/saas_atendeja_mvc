-- Remover tabela messages primeiro devido à dependência
DROP TABLE IF EXISTS messages CASCADE;

-- Remover tabela conversation
DROP TABLE IF EXISTS conversation CASCADE;

-- Criar tabela conversation com o case correto
CREATE TABLE conversation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_interaction_at TIMESTAMP,
    needs_follow_up BOOLEAN DEFAULT false,
    follow_up_sent_at TIMESTAMP,
    restaurant_id UUID REFERENCES restaurants(id),
    customer_id UUID REFERENCES customers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    conversation_id UUID REFERENCES conversation(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 