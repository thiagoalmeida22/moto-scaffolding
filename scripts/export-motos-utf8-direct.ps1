# Script genérico para exportar tabelas com UTF-8 usando -r
# Uso: .\scripts\export-motos-utf8-direct.ps1 -TableName "Motos" -MigrationNumber "012"

param(
    [Parameter(Mandatory=$true)]
    [string]$TableName,
    
    [Parameter(Mandatory=$true)]
    [string]$MigrationNumber,
    
    [string]$MySQLUser = "root",
    [string]$MySQLHost = "localhost",
    [string]$MySQLPort = "3306",
    [string]$Database = "motos"
)

# Tentar encontrar mysqldump
$mysqlDumpPaths = @(
    "D:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
    "D:\Program Files\MySQL\MySQL Server 8.1\bin\mysqldump.exe",
    "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysqldump.exe",
    "mysqldump"
)

$mysqlDump = $null
foreach ($path in $mysqlDumpPaths) {
    if ($path -eq "mysqldump") {
        $cmd = Get-Command mysqldump -ErrorAction SilentlyContinue
        if ($cmd) {
            $mysqlDump = "mysqldump"
            break
        }
    } elseif (Test-Path $path) {
        $mysqlDump = $path
        break
    }
}

if (-not $mysqlDump) {
    Write-Host "Erro: mysqldump não encontrado!" -ForegroundColor Red
    exit 1
}

# Gerar nome do arquivo de saída
$tableNameLower = $TableName.ToLower()
$outputFile = "migrations\${MigrationNumber}_populate_${tableNameLower}_table.sql"
$tempFile = "migrations\temp_dump_${tableNameLower}.sql"

Write-Host "=== Exportar tabela $TableName com UTF-8 ===" -ForegroundColor Cyan
Write-Host "   Migration: $MigrationNumber" -ForegroundColor Cyan
Write-Host "   Arquivo: $outputFile" -ForegroundColor Cyan
Write-Host ""

# Solicitar senha
$mysqlPass = Read-Host "Digite a senha do MySQL" -AsSecureString
$mysqlPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPass)
)

Write-Host "Exportando..." -ForegroundColor Yellow

# Criar cabeçalho
$header = @"
CREATE DATABASE IF NOT EXISTS $Database;
USE $Database;

-- Migration para popular tabela $TableName com dados atuais
-- Gerado em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@

# Comando mysqldump usando -r (sem redirect)
# Formato: mysqldump -u root -p database table -r output.sql
$dumpArgs = @(
    "-u", $MySQLUser,
    "-p$mysqlPassPlain",
    "-h", $MySQLHost,
    "-P", $MySQLPort,
    "--default-character-set=utf8mb4",
    "--no-create-info",
    "--skip-triggers",
    "--skip-add-drop-table",
    "--complete-insert",
    "--skip-extended-insert",
    $Database,
    $TableName,
    "-r", $tempFile
)

try {
    Write-Host "Executando mysqldump..." -ForegroundColor Yellow
    $result = & $mysqlDump $dumpArgs 2>&1
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $tempFile)) {
        Write-Host "Lendo arquivo temporário..." -ForegroundColor Yellow
        
        # Ler arquivo com encoding correto
        $dumpContent = [System.IO.File]::ReadAllText($tempFile, [System.Text.Encoding]::UTF8)
        
        # Filtrar apenas INSERTs
        $lines = $dumpContent -split "`r?`n"
        $inserts = $lines | Where-Object { $_ -match "INSERT INTO" }
        
        if ($inserts) {
            $content = $header + ($inserts -join "`n") + "`n"
            
            # Salvar com UTF-8 sem BOM
            [System.IO.File]::WriteAllText(
                (Resolve-Path .).Path + "\" + $outputFile, 
                $content, 
                [System.Text.UTF8Encoding]::new($false)
            )
            
            Write-Host ""
            Write-Host "✅ Arquivo criado: $outputFile" -ForegroundColor Green
            Write-Host "   Tabela: $TableName" -ForegroundColor Green
            Write-Host "   Total de INSERTs: $($inserts.Count)" -ForegroundColor Green
            Write-Host "   Encoding: UTF-8 (sem BOM)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Nenhum INSERT encontrado." -ForegroundColor Yellow
        }
        
        # Remover arquivo temporário
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    } else {
        Write-Host "Erro ao exportar!" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
} catch {
    Write-Host "Erro: $_" -ForegroundColor Red
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

# Limpar senha
$mysqlPassPlain = $null
$mysqlPass = $null

Write-Host ""

