#!/bin/bash

# Script para atualizar a aplicação (pull do Git e redeploy)
# Uso: ./scripts/update.sh

set -e

echo "🔄 Atualizando aplicação..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verifica se está em um repositório Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Não é um repositório Git. Pulando atualização do código.${NC}"
else
    # Faz pull das mudanças
    echo "📥 Fazendo pull do repositório..."
    git pull origin main || git pull origin master || echo -e "${YELLOW}⚠️  Não foi possível fazer pull. Continuando...${NC}"
fi

# Executa o deploy
echo "🚀 Executando deploy..."
./scripts/deploy.sh

echo -e "${GREEN}✅ Atualização concluída!${NC}"

