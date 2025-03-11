#!/bin/bash

echo "==============================================="
echo "🔄 Reiniciando o frontend"
echo "==============================================="

# Salvar o diretório atual
BASE_DIR=$(pwd)

echo "🔍 Verificando processos em execução..."
pkill -f "node.*start.*frontend" || true
echo "✅ Processos do frontend encerrados"

echo "🔄 Aguardando processos encerrarem..."
sleep 3

echo "🧹 Limpando cache do frontend..."
rm -rf "$BASE_DIR/frontend/node_modules/.cache" || true

echo "🚀 Iniciando o frontend..."
cd "$BASE_DIR/frontend" && npm start &

echo "==============================================="
echo "✅ Frontend reiniciado com sucesso!"
echo "==============================================="
echo "📋 Correções implementadas:"
echo " - Modificada a função cleanCustomerData para incluir apenas campos permitidos"
echo " - Adicionado tratamento específico para erros 400 Bad Request"
echo " - Melhorado o log de erros para facilitar a depuração"
echo "==============================================="
echo "📱 O frontend estará disponível em:"
echo "http://localhost:3000"
echo "===============================================" 