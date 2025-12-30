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
    echo "Copiando env.production.template para .env.production..."
    if [ -f "env.production.template" ]; then
        cp env.production.template .env.production
        echo -e "${YELLOW}⚠️  Por favor, configure as variáveis em .env.production antes de continuar!${NC}"
        exit 1
    else
        echo -e "${RED}❌ Erro: env.production.template não encontrado!${NC}"
        exit 1
    fi
fi

# Criar .env a partir do .env.production (Docker Compose lê .env automaticamente)
if [ ! -f ".env" ] || [ ".env.production" -nt ".env" ]; then
    echo "📝 Criando .env a partir do .env.production..."
    cp .env.production .env
fi

# Validar configurações críticas
if grep -q "^PROD_DB_USER=root" .env; then
    echo -e "${RED}❌ ERRO: PROD_DB_USER não pode ser 'root'!${NC}"
    echo "   O MySQL não permite usar 'root' como MYSQL_USER"
    echo "   Corrigindo automaticamente para 'moto_user'..."
    sed -i 's/^PROD_DB_USER=root/PROD_DB_USER=moto_user/g' .env
    if [ -f ".env.production" ]; then
        sed -i 's/^PROD_DB_USER=root/PROD_DB_USER=moto_user/g' .env.production
    fi
    echo -e "${GREEN}✅ PROD_DB_USER corrigido para 'moto_user'${NC}"
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

# Gera configuração do nginx baseada na existência de certificados SSL
if [ -f "scripts/generate-nginx-config.sh" ]; then
    echo "⚙️  Gerando configuração do nginx..."
    chmod +x scripts/generate-nginx-config.sh
    ./scripts/generate-nginx-config.sh
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

# Verifica se certificados SSL existem
echo ""
echo "🔒 Verificando configuração SSL..."
if [ -f "nginx/ssl/cert.pem" ] && [ -f "nginx/ssl/key.pem" ]; then
    echo -e "${GREEN}✅ Certificados SSL encontrados! HTTPS está habilitado.${NC}"
    
    # Testa HTTPS
    if curl -k -f https://localhost/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ HTTPS está funcionando!${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTPS pode não estar funcionando corretamente${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Certificados SSL não encontrados. Site está rodando apenas em HTTP.${NC}"
    echo ""
    echo "📝 Para habilitar HTTPS, execute:"
    echo "   ./scripts/setup-ssl.sh seu-dominio.com seu-email@exemplo.com"
    echo ""
    echo "   Ou configure manualmente os certificados em:"
    echo "   - nginx/ssl/cert.pem"
    echo "   - nginx/ssl/key.pem"
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
echo ""
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    echo "🔒 Para habilitar HTTPS:"
    echo "  ./scripts/setup-ssl.sh seu-dominio.com seu-email@exemplo.com"
fi

