#!/bin/bash

# Script para gerar configuração do nginx baseado na existência de certificados SSL
# Este script é chamado automaticamente pelo deploy.sh

NGINX_CONFIG="nginx/conf.d/default.conf"
SSL_CERT="nginx/ssl/cert.pem"
SSL_KEY="nginx/ssl/key.pem"

# Verifica se certificados SSL existem
if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
    echo "🔒 Certificados SSL encontrados - Gerando configuração com HTTPS habilitado..."
    HAS_SSL=true
else
    echo "⚠️  Certificados SSL não encontrados - Gerando configuração apenas HTTP..."
    HAS_SSL=false
fi

# Gera configuração do nginx
cat > "$NGINX_CONFIG" << 'EOF'
# Proxy para app:3000 — resolver Docker + variável evita falha de DNS no startup do NGINX.
EOF

# Adiciona configuração HTTP
cat >> "$NGINX_CONFIG" << 'EOF'

# Servidor HTTP
server {
    listen 80;
    server_name motoinfo.com.br www.motoinfo.com.br;

    resolver 127.0.0.11 valid=10s ipv6=off;
    set $nextjs_upstream http://app:3000;

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Health check endpoint (sempre acessível via HTTP)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
EOF

# Se SSL existe, adiciona redirecionamento HTTP -> HTTPS
if [ "$HAS_SSL" = true ]; then
    cat >> "$NGINX_CONFIG" << 'EOF'

    # Redireciona todo tráfego HTTP para HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
EOF
else
    # Se não tem SSL, serve normalmente em HTTP
    cat >> "$NGINX_CONFIG" << 'EOF'

    # Proxy para Next.js
    location / {
        proxy_pass $nextjs_upstream;
        proxy_http_version 1.1;
        
        # Headers importantes
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache de conexão
        proxy_cache_bypass $http_upgrade;
    }

    # Otimização para arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass $nextjs_upstream;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
EOF
fi

cat >> "$NGINX_CONFIG" << 'EOF'
}
EOF

# Se SSL existe, adiciona configuração HTTPS
if [ "$HAS_SSL" = true ]; then
    cat >> "$NGINX_CONFIG" << 'EOF'

# Configuração HTTPS
server {
    listen 443 ssl http2;
    server_name motoinfo.com.br www.motoinfo.com.br;

    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL Configuration - Segurança moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    resolver 127.0.0.11 valid=10s ipv6=off;
    set $nextjs_upstream http://app:3000;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Proxy para Next.js
    location / {
        proxy_pass $nextjs_upstream;
        proxy_http_version 1.1;
        
        # Headers importantes
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port 443;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache de conexão
        proxy_cache_bypass $http_upgrade;
    }

    # Otimização para arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass $nextjs_upstream;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
EOF
fi

echo "✅ Configuração do nginx gerada com sucesso!"

