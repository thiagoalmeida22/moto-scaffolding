#!/bin/bash

# Script genérico para exportar tabelas com UTF-8
# Uso: ./scripts/export-motos-utf8-direct.sh -TableName "Motos" -MigrationNumber "012"

# Parse de argumentos
TableName=""
MigrationNumber=""
MySQLUser="root"
MySQLHost="localhost"
MySQLPort="3306"
Database="motos"

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

# Verificar se mysqldump está disponível
if ! command -v mysqldump &> /dev/null; then
    echo "Erro: mysqldump não encontrado!"
    exit 1
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

# Executar mysqldump
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
    
    if [ -f "$tempFile" ]; then
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
        echo "Erro: Arquivo temporário não foi criado!"
        exit 1
    fi
else
    echo "Erro ao exportar!"
    rm -f "$tempFile"
    exit 1
fi

echo ""

