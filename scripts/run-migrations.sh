#!/bin/bash

# Script para executar todas as migrations do banco de dados
# Uso: ./scripts/run-migrations.sh

set -e

echo "🗄️  Executando migrations do banco de dados..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erro: docker-compose.yml não encontrado!${NC}"
    echo "Execute este script a partir do diretório raiz do projeto."
    exit 1
fi

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Erro: .env.production não encontrado!${NC}"
    exit 1
fi

# Ler senha do root do MySQL
MYSQL_ROOT_PASS=$(grep MYSQL_ROOT_PASSWORD .env.production | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$MYSQL_ROOT_PASS" ]; then
    echo -e "${YELLOW}⚠️  MYSQL_ROOT_PASSWORD não encontrado no .env.production${NC}"
    read -sp "Digite a senha do root do MySQL: " MYSQL_ROOT_PASS
    echo
fi

# Verificar se MySQL está rodando
if ! docker-compose ps mysql | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  MySQL não está rodando. Iniciando...${NC}"
    docker-compose up -d mysql
    echo "⏳ Aguardando MySQL iniciar..."
    sleep 10
fi

# Verificar se diretório de migrations existe
if [ ! -d "migrations" ]; then
    echo -e "${RED}❌ Diretório 'migrations' não encontrado!${NC}"
    exit 1
fi

# Contar migrations
MIGRATION_COUNT=$(find migrations -name "*.sql" | wc -l)
echo "📊 Encontradas $MIGRATION_COUNT migrations"

# Executar migrations em ordem
MIGRATION_NUM=0
for migration in migrations/*.sql; do
    if [ -f "$migration" ]; then
        MIGRATION_NUM=$((MIGRATION_NUM + 1))
        echo ""
        echo -e "${YELLOW}[$MIGRATION_NUM/$MIGRATION_COUNT]${NC} Executando: $(basename $migration)"
        
        if docker-compose exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASS}" motos < "$migration" 2>/dev/null; then
            echo -e "${GREEN}✅ Sucesso!${NC}"
        else
            echo -e "${RED}❌ Erro ao executar: $(basename $migration)${NC}"
            echo "Continuando com as próximas migrations..."
        fi
    fi
done

echo ""
echo -e "${GREEN}✅ Migrations concluídas!${NC}"
echo ""
echo "Para verificar, execute:"
echo "  docker-compose exec mysql mysql -u root -psenhaaqui motos -e 'SHOW TABLES;'"

