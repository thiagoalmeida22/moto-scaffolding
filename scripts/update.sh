#!/bin/bash

# Script para atualizar a aplicação (pull do Git e redeploy)
# Uso: ./scripts/update.sh
# 
# IMPORTANTE: Este script NÃO apaga os dados do MySQL!
# Os dados estão em um volume Docker persistente e são preservados.

set -e

echo "🔄 Atualizando aplicação..."
echo "📌 Nota: Os dados do MySQL serão preservados (volume persistente)"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verifica se está em um repositório Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Não é um repositório Git. Pulando atualização do código.${NC}"
else
    # Verifica branch atual
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "${BLUE}📍 Branch atual: $CURRENT_BRANCH${NC}"
    
    # Faz pull das mudanças
    echo "📥 Fazendo pull do repositório..."
    git pull origin $CURRENT_BRANCH || git pull origin main || git pull origin master || echo -e "${YELLOW}⚠️  Não foi possível fazer pull. Continuando...${NC}"
fi

# Verifica se MySQL está rodando e preserva dados
echo ""
echo -e "${BLUE}💾 Verificando MySQL...${NC}"
if docker-compose ps mysql | grep -q "Up"; then
    echo -e "${GREEN}✅ MySQL está rodando. Dados serão preservados.${NC}"
    
    # Opcional: Fazer backup antes de atualizar (recomendado)
    read -p "Deseja fazer backup do MySQL antes de atualizar? (s/N): " backup_choice
    if [[ $backup_choice =~ ^[Ss]$ ]]; then
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "💾 Criando backup: $BACKUP_FILE"
        MYSQL_ROOT_PASS=$(grep MYSQL_ROOT_PASSWORD .env.production | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        DB_NAME=$(grep PROD_DB_NAME .env.production | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        
        if docker-compose exec mysql mysqldump -u root -p"${MYSQL_ROOT_PASS}" "${DB_NAME}" > "$BACKUP_FILE" 2>/dev/null; then
            echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE${NC}"
        else
            echo -e "${YELLOW}⚠️  Não foi possível criar backup. Continuando...${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  MySQL não está rodando. Será iniciado após o deploy.${NC}"
fi

# Executa o deploy (MySQL não será recriado, apenas reiniciado se necessário)
echo ""
echo "🚀 Executando deploy..."
echo -e "${BLUE}ℹ️  Apenas a aplicação será reconstruída. MySQL permanece intacto.${NC}"

# Para containers da aplicação e NGINX, mas mantém MySQL
docker-compose stop app nginx || true

# Reconstroi apenas a aplicação
docker-compose build --no-cache app

# Inicia tudo (MySQL já está rodando, então não será recriado)
docker-compose up -d

# Aguarda serviços iniciarem
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Verifica saúde dos serviços
echo ""
echo "🏥 Verificando saúde dos serviços..."
docker-compose ps

echo ""
echo -e "${GREEN}✅ Atualização concluída!${NC}"
echo ""
echo -e "${BLUE}📊 Status:${NC}"
echo "  - Aplicação: Atualizada e reiniciada"
echo "  - NGINX: Reiniciado"
echo "  - MySQL: Dados preservados (volume persistente)"
echo ""
echo "Para verificar logs: docker-compose logs -f"

