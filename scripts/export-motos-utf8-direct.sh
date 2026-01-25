#!/bin/bash

# Script genérico para exportar tabelas com UTF-8
# Uso: ./scripts/export-motos-utf8-direct.sh -TableName "Motos" -MigrationNumber "012"

# Tentar ler configurações do .env.production se existir
ENV_USER=""
ENV_DB_NAME=""
if [ -f ".env.production" ]; then
    # Ler configurações do .env.production
    ENV_USER=$(grep "^PROD_DB_USER=" .env.production 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")
    ENV_DB_NAME=$(grep "^PROD_DB_NAME=" .env.production 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")
fi

# Parse de argumentos
TableName=""
MigrationNumber=""
# Nota: Para exportações com mysqldump, geralmente usamos 'root' (tem todas as permissões)
# Mas pode usar 'moto_user' se tiver permissões SELECT na tabela
# O usuário pode ser sobrescrito via parâmetro -MySQLUser
MySQLUser="${ENV_USER:-root}"  # Usa do .env.production ou root como padrão
MySQLHost="localhost"
MySQLPort="3306"
Database="${ENV_DB_NAME:-motos}"  # Usa do .env.production ou 'motos' como padrão

while [[ $# -gt 0 ]]; do
    case $1 in
        -TableName)
            TableName="$2"
            shift 2
            ;;
        -MigrationNumber)
            MigrationNumber="$2"
            shift 2
            ;;
        -MySQLUser)
            MySQLUser="$2"
            shift 2
            ;;
        -MySQLHost)
            MySQLHost="$2"
            shift 2
            ;;
        -MySQLPort)
            MySQLPort="$2"
            shift 2
            ;;
        -Database)
            Database="$2"
            shift 2
            ;;
        *)
            echo "Argumento desconhecido: $1"
            exit 1
            ;;
    esac
done

# Validar parâmetros obrigatórios
if [ -z "$TableName" ] || [ -z "$MigrationNumber" ]; then
    echo "Erro: TableName e MigrationNumber são obrigatórios!"
    echo "Uso: $0 -TableName \"Motos\" -MigrationNumber \"012\""
    exit 1
fi

# Detectar se MySQL está em Docker
USE_DOCKER=false
if command -v docker-compose &> /dev/null && [ -f "docker-compose.yml" ]; then
    if docker-compose ps mysql 2>/dev/null | grep -q "Up"; then
        USE_DOCKER=true
        echo "🐳 Detectado MySQL em container Docker"
    fi
fi

# Verificar se mysqldump está disponível (localmente ou via Docker)
if [ "$USE_DOCKER" = false ]; then
    if ! command -v mysqldump &> /dev/null; then
        echo "Erro: mysqldump não encontrado!"
        exit 1
    fi
fi

# Gerar nomes de arquivo
tableNameLower=$(echo "$TableName" | tr '[:upper:]' '[:lower:]')
outputFile="migrations/${MigrationNumber}_populate_${tableNameLower}_table.sql"
tempFile="migrations/temp_dump_${tableNameLower}.sql"

echo "=== Exportar tabela $TableName com UTF-8 ==="
echo "   Migration: $MigrationNumber"
echo "   Arquivo: $outputFile"
echo ""

# Solicitar senha
read -sp "Digite a senha do MySQL: " mysqlPass
echo ""

echo "Exportando..."

# Criar diretório migrations se não existir
mkdir -p migrations

# Criar cabeçalho
header="CREATE DATABASE IF NOT EXISTS $Database;
USE $Database;

-- Migration para popular tabela $TableName com dados atuais
-- Gerado em: $(date '+%Y-%m-%d %H:%M:%S')

"

# Executar mysqldump (dentro do container ou localmente)
if [ "$USE_DOCKER" = true ]; then
    # Executar mysqldump dentro do container Docker
    # No Docker, o host é "localhost" dentro do container, não precisa especificar -h
    if docker-compose exec -T mysql mysqldump -u "$MySQLUser" -p"$mysqlPass" \
        --default-character-set=utf8mb4 \
        --no-create-info \
        --skip-triggers \
        --skip-add-drop-table \
        --complete-insert \
        --skip-extended-insert \
        "$Database" \
        "$TableName" > "$tempFile" 2>/dev/null; then
        DUMP_SUCCESS=true
    else
        DUMP_SUCCESS=false
    fi
else
    # Executar mysqldump localmente
    if mysqldump -u "$MySQLUser" -p"$mysqlPass" \
        -h "$MySQLHost" \
        -P "$MySQLPort" \
        --default-character-set=utf8mb4 \
        --no-create-info \
        --skip-triggers \
        --skip-add-drop-table \
        --complete-insert \
        --skip-extended-insert \
        "$Database" \
        "$TableName" \
        -r "$tempFile" 2>/dev/null; then
        DUMP_SUCCESS=true
    else
        DUMP_SUCCESS=false
    fi
fi

if [ "$DUMP_SUCCESS" = true ] && [ -f "$tempFile" ]; then
    # Filtrar apenas INSERTs
    inserts=$(grep "^INSERT INTO" "$tempFile" 2>/dev/null || echo "")
    
    if [ -n "$inserts" ]; then
        # Criar arquivo final
        echo -n "$header" > "$outputFile"
        grep "^INSERT INTO" "$tempFile" >> "$outputFile"
        echo "" >> "$outputFile"
        
        echo ""
        echo "✅ Arquivo criado: $outputFile"
        echo "   Tabela: $TableName"
        insertCount=$(grep -c "^INSERT INTO" "$tempFile" || echo "0")
        echo "   Total de INSERTs: $insertCount"
        echo "   Encoding: UTF-8"
    else
        echo "⚠️  Nenhum INSERT encontrado."
    fi
    
    # Remover arquivo temporário
    rm -f "$tempFile"
else
    echo "Erro ao exportar!"
    echo "Verifique se:"
    echo "  - O container MySQL está rodando (docker-compose ps mysql)"
    echo "  - As credenciais estão corretas"
    echo "  - O banco de dados e tabela existem"
    rm -f "$tempFile"
    exit 1
fi

echo ""

