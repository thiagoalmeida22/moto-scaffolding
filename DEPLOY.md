# 🚀 Guia de Deploy - Moto Scaffolding

Este guia explica como fazer deploy da aplicação em uma VPS usando Docker Compose e NGINX.

## 📋 Pré-requisitos

- VPS com Ubuntu/Debian
- Docker e Docker Compose instalados
- Acesso SSH à VPS
- Domínio configurado (opcional, mas recomendado)

## 🔧 Instalação Inicial

### 1. Instalar Docker e Docker Compose

```bash
# Atualizar sistema
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 2. Clonar o Repositório

```bash
cd /opt  # ou outro diretório de sua preferência
git clone https://github.com/seu-usuario/moto-scaffolding.git
cd moto-scaffolding
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env.production` na raiz do projeto:

```bash
cp .env.production.example .env.production
nano .env.production
```

Configure as seguintes variáveis:

```env
# Configurações de Produção
NODE_ENV=production

# Database - Produção
PROD_DB_HOST=seu-host-mysql
PROD_DB_USER=seu-usuario
PROD_DB_PASS=sua-senha
PROD_DB_NAME=nome-do-banco

# JWT Secret (deve ser um JSON Web Key)
# Gere um com: node -e "console.log(JSON.stringify(require('crypto').randomBytes(32)))"
PROD_ADMIN_SECRET={"kty":"oct","k":"SEU_SECRET_KEY_AQUI","alg":"HS256"}

# Porta da aplicação (opcional, padrão é 3000)
PORT=3000
```

**Importante:** Para gerar o `PROD_ADMIN_SECRET`, execute:

```bash
node -e "const crypto = require('crypto'); const key = crypto.randomBytes(32).toString('base64'); console.log(JSON.stringify({kty:'oct',k:key,alg:'HS256'}))"
```

### 4. Configurar Firewall

```bash
# Dar permissão de execução
chmod +x scripts/setup-firewall.sh

# Executar (requer sudo)
sudo ./scripts/setup-firewall.sh
```

**⚠️ ATENÇÃO:** Certifique-se de que o SSH está funcionando antes de sair da sessão!

### 5. Criar Diretórios Necessários

```bash
# Criar diretórios para logs do NGINX
mkdir -p nginx/logs
mkdir -p nginx/ssl  # Para certificados SSL (opcional)

# Dar permissões corretas
chmod -R 755 nginx
```

## 🚀 Deploy

### Deploy Inicial

```bash
# Dar permissão de execução
chmod +x scripts/deploy.sh

# Executar deploy
./scripts/deploy.sh
```

### Atualizar Aplicação

Para atualizar a aplicação com as últimas mudanças do Git:

```bash
chmod +x scripts/update.sh
./scripts/update.sh
```

Ou manualmente:

```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔍 Verificação e Monitoramento

### Verificar Status

```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f app
docker-compose logs -f nginx

# Verificar saúde dos serviços
curl http://localhost:3000/api/health
curl http://localhost/health
```

### Comandos Úteis

```bash
# Parar aplicação
docker-compose down

# Reiniciar aplicação
docker-compose restart

# Reconstruir e reiniciar
docker-compose up -d --build

# Ver uso de recursos
docker stats

# Limpar recursos não utilizados
docker system prune -a
```

## 🔒 Configurar SSL/HTTPS (Opcional mas Recomendado)

### Usando Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática (já configurado pelo Certbot)
sudo certbot renew --dry-run
```

Depois de obter o certificado:

1. Descomente a seção HTTPS em `nginx/conf.d/default.conf`
2. Ajuste os caminhos dos certificados
3. Reinicie o NGINX: `docker-compose restart nginx`

### Configuração Manual

Se você já tem certificados SSL:

1. Coloque os arquivos `cert.pem` e `key.pem` em `nginx/ssl/`
2. Descomente a seção HTTPS em `nginx/conf.d/default.conf`
3. Reinicie: `docker-compose restart nginx`

## 📊 Estrutura de Arquivos

```
moto-scaffolding/
├── docker-compose.yml          # Orquestração dos serviços
├── Dockerfile                  # Imagem da aplicação
├── .env.production             # Variáveis de ambiente (não commitado)
├── nginx/
│   ├── nginx.conf             # Configuração principal do NGINX
│   ├── conf.d/
│   │   └── default.conf        # Configuração do servidor
│   ├── ssl/                    # Certificados SSL (não commitado)
│   └── logs/                   # Logs do NGINX
└── scripts/
    ├── deploy.sh               # Script de deploy
    ├── update.sh               # Script de atualização
    └── setup-firewall.sh       # Script de configuração do firewall
```

## 🐛 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
docker-compose logs app

# Verificar variáveis de ambiente
docker-compose exec app env | grep PROD

# Verificar conexão com banco
docker-compose exec app ping PROD_DB_HOST
```

### NGINX retorna 502 Bad Gateway

```bash
# Verificar se a aplicação está rodando
docker-compose ps

# Verificar logs do NGINX
docker-compose logs nginx

# Verificar conectividade
docker-compose exec nginx ping app
```

### Porta já em uso

```bash
# Verificar o que está usando a porta
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000

# Parar o serviço conflitante ou alterar a porta no docker-compose.yml
```

### Problemas de permissão

```bash
# Verificar permissões dos arquivos
ls -la nginx/

# Corrigir permissões
sudo chown -R $USER:$USER nginx/
chmod -R 755 nginx/
```

## 🔄 Backup e Restauração

### Backup do Banco de Dados

```bash
# Criar backup
mysqldump -h PROD_DB_HOST -u PROD_DB_USER -p PROD_DB_NAME > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -h PROD_DB_HOST -u PROD_DB_USER -p PROD_DB_NAME < backup_20240101.sql
```

### Backup de Arquivos

```bash
# Backup das imagens (se houver)
tar -czf pictures_backup_$(date +%Y%m%d).tar.gz pictures/

# Backup de configurações
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env.production nginx/
```

## 📝 Notas Importantes

1. **Segurança:**
   - Nunca commite o arquivo `.env.production`
   - Use senhas fortes para o banco de dados
   - Configure SSL/HTTPS em produção
   - Mantenha o sistema e dependências atualizadas

2. **Performance:**
   - Monitore o uso de recursos com `docker stats`
   - Ajuste os limites de recursos no `docker-compose.yml` conforme necessário
   - Configure cache do NGINX para arquivos estáticos

3. **Manutenção:**
   - Faça backups regulares do banco de dados
   - Monitore os logs regularmente
   - Mantenha as dependências atualizadas

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Verifique o status: `docker-compose ps`
3. Consulte a documentação do Docker e NGINX
4. Verifique as issues do projeto no GitHub

