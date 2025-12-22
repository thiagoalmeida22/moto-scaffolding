#!/bin/bash

# Script para configurar firewall UFW na VPS
# Uso: sudo ./scripts/setup-firewall.sh

set -e

echo "🔥 Configurando firewall UFW..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor, execute com sudo: sudo ./scripts/setup-firewall.sh${NC}"
    exit 1
fi

# Verifica se UFW está instalado
if ! command -v ufw &> /dev/null; then
    echo "📦 Instalando UFW..."
    apt-get update
    apt-get install -y ufw
fi

# Reseta UFW (cuidado em produção!)
echo "🔄 Resetando regras do UFW..."
ufw --force reset

# Política padrão: negar tudo
echo "🔒 Configurando política padrão..."
ufw default deny incoming
ufw default allow outgoing

# Permite SSH (IMPORTANTE: não feche esta porta!)
echo "🔑 Permitindo SSH (porta 22)..."
ufw allow 22/tcp comment 'SSH'

# Permite HTTP
echo "🌐 Permitindo HTTP (porta 80)..."
ufw allow 80/tcp comment 'HTTP'

# Permite HTTPS
echo "🔒 Permitindo HTTPS (porta 443)..."
ufw allow 443/tcp comment 'HTTPS'

# Permite MySQL (apenas se o MySQL estiver na mesma VPS)
read -p "O MySQL está rodando nesta VPS? (s/N): " mysql_local
if [[ $mysql_local =~ ^[Ss]$ ]]; then
    read -p "Digite o IP que pode acessar o MySQL (ou deixe em branco para localhost): " mysql_ip
    if [ -z "$mysql_ip" ]; then
        echo "🔐 Permitindo MySQL apenas para localhost..."
        ufw allow from 127.0.0.1 to any port 3306 comment 'MySQL localhost'
    else
        echo "🔐 Permitindo MySQL para $mysql_ip..."
        ufw allow from $mysql_ip to any port 3306 comment 'MySQL remote'
    fi
fi

# Habilita UFW
echo "✅ Habilitando UFW..."
ufw --force enable

# Mostra status
echo ""
echo -e "${GREEN}✅ Firewall configurado!${NC}"
echo ""
echo "📊 Status do firewall:"
ufw status verbose

echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   - Certifique-se de que o SSH está funcionando antes de sair desta sessão!"
echo "   - Se você perder acesso SSH, pode precisar acessar via console da VPS"
echo "   - Para desabilitar temporariamente: sudo ufw disable"
echo "   - Para ver logs: sudo tail -f /var/log/ufw.log"

