#!/bin/bash

# Script para configurar certificados SSL com Let's Encrypt
# Uso: ./scripts/setup-ssl.sh seu-dominio.com seu-email@exemplo.com

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica argumentos
if [ $# -lt 2 ]; then
    echo -e "${RED}❌ Erro: Argumentos insuficientes!${NC}"
    echo "Uso: ./scripts/setup-ssl.sh <dominio> <email>"
    echo "Exemplo: ./scripts/setup-ssl.sh motoinfo.com.br admin@motoinfo.com.br"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "🔒 Configurando SSL para o domínio: $DOMAIN"
echo "📧 Email: $EMAIL"

# Verifica se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erro: docker-compose.yml não encontrado!${NC}"
    echo "Execute este script a partir do diretório raiz do projeto."
    exit 1
fi

# Verifica se certbot está instalado
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando certbot..."
    apt update
    apt install -y certbot
fi

# Cria diretório para certificados se não existir
mkdir -p nginx/ssl

# Verifica se o domínio está acessível
echo "🔍 Verificando se o domínio está acessível..."
if ! curl -f "http://$DOMAIN" > /dev/null 2>&1 && ! curl -f "http://$DOMAIN/health" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Aviso: Não foi possível acessar http://$DOMAIN${NC}"
    echo "   Certifique-se de que:"
    echo "   1. O DNS do domínio está apontando para este servidor"
    echo "   2. A porta 80 está aberta no firewall"
    echo "   3. O nginx está rodando (execute ./scripts/deploy.sh primeiro)"
    echo ""
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Para o nginx temporariamente para liberar a porta 80
echo "🛑 Parando nginx temporariamente..."
docker-compose stop nginx || true

# Obtém certificados SSL
echo "🔐 Obtendo certificados SSL do Let's Encrypt..."
certbot certonly --standalone \
    --preferred-challenges http \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --expand

# Copia certificados para o diretório do projeto
echo "📋 Copiando certificados para nginx/ssl/..."
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/key.pem

# Ajusta permissões
chmod 644 nginx/ssl/cert.pem
chmod 600 nginx/ssl/key.pem

# Gera nova configuração do nginx com SSL habilitado
if [ -f "scripts/generate-nginx-config.sh" ]; then
    echo "⚙️  Gerando configuração do nginx com SSL..."
    chmod +x scripts/generate-nginx-config.sh
    ./scripts/generate-nginx-config.sh
fi

# Reinicia o nginx
echo "▶️  Reiniciando nginx..."
docker-compose up -d nginx

echo ""
echo -e "${GREEN}✅ Certificados SSL configurados com sucesso!${NC}"
echo ""
echo "📝 Próximos passos:"
echo "   1. Os certificados serão renovados automaticamente pelo certbot"
echo "   2. Configure um cron job para renovação:"
echo "      crontab -e"
echo "      Adicione: 0 3 * * * certbot renew --quiet && docker exec moto-scaffolding-nginx nginx -s reload"
echo ""
echo "   3. Ou use o script de renovação: ./scripts/renew-ssl.sh"
echo ""

