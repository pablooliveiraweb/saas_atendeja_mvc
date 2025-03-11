-- Atualizar registros com name nulo
UPDATE customers 
SET name = 'Cliente sem nome' 
WHERE name IS NULL;

-- Atualizar registros com email nulo
UPDATE customers 
SET email = 'email@exemplo.com' 
WHERE email IS NULL;

-- Atualizar registros com phone nulo
UPDATE customers 
SET phone = 'Sem telefone' 
WHERE phone IS NULL; 