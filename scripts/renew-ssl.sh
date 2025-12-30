#!/bin/bash

# Script para renovar certificados SSL e recarregar nginx
# Use este script em um cron job para renovação automática

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔄 Verificando renovação de certificados SSL..."

# Verifica se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erro: docker-compose.yml não encontrado!${NC}"
    exit 1
fi

# Renova certificados (só renova se estiverem próximos do vencimento)
certbot renew --quiet

# Verifica se há novos certificados
DOMAIN=$(ls /etc/letsencrypt/live/ 2>/dev/null | head -n 1)

if [ -n "$DOMAIN" ]; then
    # Copia certificados atualizados
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/cert.pem
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/key.pem
    
    # Ajusta permissões
    chmod 644 nginx/ssl/cert.pem
    chmod 600 nginx/ssl/key.pem
    
    # Gera nova configuração do nginx (caso tenha mudado)
    if [ -f "scripts/generate-nginx-config.sh" ]; then
        chmod +x scripts/generate-nginx-config.sh
        ./scripts/generate-nginx-config.sh
    fi
    
    # Recarrega nginx sem downtime
    docker exec moto-scaffolding-nginx nginx -s reload
    
    echo -e "${GREEN}✅ Certificados SSL atualizados e nginx recarregado!${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum certificado encontrado para renovar${NC}"
fi

