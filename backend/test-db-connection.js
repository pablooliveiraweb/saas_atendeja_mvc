const { Client } = require('pg');

// Tente diferentes senhas
const passwords = ['postgres', 'Cpu031191', ''];

async function testConnection() {
  for (const password of passwords) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: password,
      database: 'atende'
    });

    try {
      console.log(`Tentando conectar com a senha: "${password}"`);
      await client.connect();
      console.log('Conexão bem-sucedida!');
      console.log(`A senha correta é: "${password}"`);
      await client.end();
      return password;
    } catch (error) {
      console.log(`Falha na conexão com a senha: "${password}"`);
      console.log(`Erro: ${error.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignorar erro ao fechar conexão
      }
    }
  }
  
  console.log('Nenhuma das senhas testadas funcionou.');
  return null;
}

testConnection(); 