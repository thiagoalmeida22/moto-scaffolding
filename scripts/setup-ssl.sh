#!/bin/bash

# Script para configurar certificados SSL com Let's Encrypt
# Uso: ./scripts/setup-ssl.sh seu-dominio.com seu-email@exemplo.com
#
# certbot --standalone ocupa a porta 80; o script para o container nginx antes.
# Usa "docker compose" (v2) se existir, senão "docker-compose" (v1).

set -e

# Compose v2 (plugin) ou v1 (binário legado)
compose() {
    if docker compose version &>/dev/null; then
        docker compose "$@"
    elif command -v docker-compose &>/dev/null; then
        docker-compose "$@"
    else
        echo "Erro: instale o Docker Compose (docker compose ou docker-compose)."
        exit 1
    fi
}

stop_nginx_for_certbot() {
    echo "🛑 Parando o container nginx para liberar a porta 80 (certbot --standalone)..."
    if compose stop nginx 2>/dev/null; then
        return 0
    fi
    # Fallback pelo container_name do docker-compose.yml
    if docker stop moto-scaffolding-nginx 2>/dev/null; then
        return 0
    fi
    echo "Aviso: não foi possível parar o serviço nginx via compose; tentando seguir."
}

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

stop_nginx_for_certbot
sleep 2

if command -v ss &>/dev/null && ss -tlnp 2>/dev/null | grep -qE ':80\s'; then
    echo "❌ A porta 80 ainda está em uso. Pare manualmente quem estiver escutando nela, por exemplo:"
    echo "   docker compose stop nginx"
    echo "   ou: docker stop moto-scaffolding-nginx"
    ss -tlnp 2>/dev/null | grep -E ':80\s' || true
    exit 1
fi

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
compose up -d nginx

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

