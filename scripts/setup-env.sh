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

# Verificar se PROD_DB_USER é "root" (não permitido)
if grep -q "^PROD_DB_USER=root" .env; then
    echo "❌ ERRO: PROD_DB_USER não pode ser 'root'!"
    echo "   O MySQL não permite usar 'root' como MYSQL_USER"
    echo "   Corrigindo automaticamente para 'moto_user'..."
    sed -i 's/^PROD_DB_USER=root/PROD_DB_USER=moto_user/g' .env
    # Atualizar também no .env.production
    if [ -f ".env.production" ]; then
        sed -i 's/^PROD_DB_USER=root/PROD_DB_USER=moto_user/g' .env.production
    fi
    echo "✅ PROD_DB_USER corrigido para 'moto_user'"
    echo "   Você pode alterar para outro nome se desejar (mas não pode ser 'root')"
fi

echo "✅ Configuração concluída!"

