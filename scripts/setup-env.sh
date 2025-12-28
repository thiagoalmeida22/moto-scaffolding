#!/bin/bash

# Script para configurar arquivos de ambiente
# Cria .env a partir do .env.production para o Docker Compose

set -e

if [ ! -f ".env.production" ]; then
    echo "❌ .env.production não encontrado!"
    echo "Copie env.production.template para .env.production e configure as variáveis."
    exit 1
fi

# Criar .env (Docker Compose lê automaticamente)
cp .env.production .env
echo "✅ Arquivo .env criado a partir do .env.production"

# Verificar se PROD_DB_HOST está correto
if grep -q "PROD_DB_HOST=127.0.0.1" .env || grep -q "PROD_DB_HOST=localhost" .env; then
    echo "⚠️  ATENÇÃO: PROD_DB_HOST está como 127.0.0.1 ou localhost"
    echo "   Para MySQL no Docker, deve ser 'mysql' (nome do serviço)"
    read -p "Deseja corrigir automaticamente? (s/N): " corrigir
    if [[ $corrigir =~ ^[Ss]$ ]]; then
        sed -i 's/PROD_DB_HOST=127.0.0.1/PROD_DB_HOST=mysql/g' .env
        sed -i 's/PROD_DB_HOST=localhost/PROD_DB_HOST=mysql/g' .env
        echo "✅ PROD_DB_HOST corrigido para 'mysql'"
    fi
fi

echo "✅ Configuração concluída!"

