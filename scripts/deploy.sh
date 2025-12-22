#!/bin/bash

# Script de deploy automatizado para VPS
# Uso: ./scripts/deploy.sh

set -e  # Para na primeira erro

echo "🚀 Iniciando deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erro: docker-compose.yml não encontrado!${NC}"
    echo "Execute este script a partir do diretório raiz do projeto."
    exit 1
fi

# Verifica se o arquivo .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Aviso: .env.production não encontrado!${NC}"
    echo "Copiando .env.production.example para .env.production..."
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo -e "${YELLOW}⚠️  Por favor, configure as variáveis em .env.production antes de continuar!${NC}"
        exit 1
    else
        echo -e "${RED}❌ Erro: .env.production.example não encontrado!${NC}"
        exit 1
    fi
fi

# Verifica se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    exit 1
fi

# Verifica se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    exit 1
fi

# Para containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down || true

# Remove imagens antigas (opcional - descomente se quiser forçar rebuild)
# echo "🗑️  Removendo imagens antigas..."
# docker-compose rm -f || true
# docker rmi moto-scaffolding-app || true

# Build da nova imagem
echo "🔨 Construindo nova imagem..."
docker-compose build --no-cache

# Inicia os containers
echo "▶️  Iniciando containers..."
docker-compose up -d

# Aguarda os serviços iniciarem
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Verifica saúde dos serviços
echo "🏥 Verificando saúde dos serviços..."

# Verifica se o app está respondendo
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Aplicação está respondendo!${NC}"
else
    echo -e "${YELLOW}⚠️  Aplicação ainda não está respondendo, aguarde mais alguns segundos...${NC}"
    sleep 5
fi

# Verifica se o NGINX está respondendo
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ NGINX está respondendo!${NC}"
else
    echo -e "${YELLOW}⚠️  NGINX ainda não está respondendo, verifique os logs com: docker-compose logs nginx${NC}"
fi

# Mostra status dos containers
echo ""
echo "📊 Status dos containers:"
docker-compose ps

# Mostra logs recentes
echo ""
echo "📋 Últimas linhas dos logs:"
docker-compose logs --tail=20

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "Comandos úteis:"
echo "  - Ver logs: docker-compose logs -f"
echo "  - Parar: docker-compose down"
echo "  - Reiniciar: docker-compose restart"
echo "  - Status: docker-compose ps"

