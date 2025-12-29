# Script para executar migrations localmente no Windows
# Uso: .\scripts\run-migrations-local.ps1

Write-Host "Executando migrations do banco de dados localmente..." -ForegroundColor Cyan

# Verificar se está no diretório correto
if (-not (Test-Path "migrations")) {
    Write-Host "Erro: Diretorio 'migrations' nao encontrado!" -ForegroundColor Red
    Write-Host "Execute este script a partir do diretorio raiz do projeto." -ForegroundColor Yellow
    exit 1
}

# Solicitar credenciais do MySQL
$mysqlUser = Read-Host "Digite o usuario do MySQL (padrao: root)"
if ([string]::IsNullOrWhiteSpace($mysqlUser)) {
    $mysqlUser = "root"
}

$mysqlPass = Read-Host "Digite a senha do MySQL" -AsSecureString
$mysqlPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPass)
)

$mysqlHost = Read-Host "Digite o host do MySQL (padrao: localhost)"
if ([string]::IsNullOrWhiteSpace($mysqlHost)) {
    $mysqlHost = "localhost"
}

$mysqlPort = Read-Host "Digite a porta do MySQL (padrao: 3306)"
if ([string]::IsNullOrWhiteSpace($mysqlPort)) {
    $mysqlPort = "3306"
}

$dbName = Read-Host "Digite o nome do banco de dados (padrao: motos)"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "motos"
}

# Verificar se mysql está disponível
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    # Tentar caminho comum do MySQL no Windows
    $commonPaths = @(
        "D:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "D:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
        "D:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
    )
    
    $mysqlExe = $null
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $mysqlExe = $path
            break
        }
    }
    
    if (-not $mysqlExe) {
        Write-Host "Erro: mysql nao encontrado no PATH!" -ForegroundColor Red
        Write-Host "Adicione MySQL ao PATH ou especifique o caminho completo." -ForegroundColor Yellow
        exit 1
    }
} else {
    $mysqlExe = "mysql"
}

Write-Host "MySQL encontrado: $mysqlExe" -ForegroundColor Green

# Criar banco de dados se nao existir
Write-Host "`nCriando banco de dados '$dbName' se nao existir..." -ForegroundColor Cyan
$createDbQuery = "CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$createDbArgs = @("-u", $mysqlUser, "-p$mysqlPassPlain", "-h", $mysqlHost, "-P", $mysqlPort, "-e", $createDbQuery)

try {
    & $mysqlExe $createDbArgs 2>&1 | Out-Null
    Write-Host "Banco de dados '$dbName' pronto!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao criar banco de dados: $_" -ForegroundColor Red
    exit 1
}

# Listar migrations
$migrations = Get-ChildItem -Path "migrations" -Filter "*.sql" | Sort-Object Name
$migrationCount = $migrations.Count

Write-Host "`nEncontradas $migrationCount migrations" -ForegroundColor Cyan
Write-Host ""

# Executar migrations
$successCount = 0
$errorCount = 0
$migrationNum = 0

foreach ($migration in $migrations) {
    $migrationNum++
    $migrationName = $migration.Name
    
    Write-Host "[$migrationNum/$migrationCount] Executando: $migrationName" -ForegroundColor Yellow
    
    $migrationArgs = @(
        "-u", $mysqlUser,
        "-p$mysqlPassPlain",
        "-h", $mysqlHost,
        "-P", $mysqlPort,
        $dbName
    )
    
    try {
        # Usar Get-Content com pipe para redirecionar arquivo (preserva encoding UTF-8)
        $fileArgs = @(
            "-u", $mysqlUser,
            "-p$mysqlPassPlain",
            "-h", $mysqlHost,
            "-P", $mysqlPort,
            $dbName,
            "--default-character-set=utf8mb4"
        )
        
        # Usar Get-Content com pipe (método nativo do PowerShell)
        # Especificar encoding UTF8 explicitamente
        $fileArgs = @(
            "-u", $mysqlUser,
            "-p$mysqlPassPlain",
            "-h", $mysqlHost,
            "-P", $mysqlPort,
            $dbName,
            "--default-character-set=utf8mb4"
        )
        
        # Ler arquivo linha por linha e passar via pipe
        # Isso funciona melhor que -Raw para arquivos grandes
        $allOutput = Get-Content $migration.FullName -Encoding UTF8 | & $mysqlExe $fileArgs 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0 -and -not ($allOutput -match "ERROR")) {
            Write-Host "  Sucesso!" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  Erro ao executar!" -ForegroundColor Red
            if ($allOutput) {
                Write-Host "  Detalhes do erro:" -ForegroundColor Red
                $allOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
            }
            $errorCount++
            Write-Host "  Continuando com as proximas migrations..." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  Erro: $_" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

# Resumo
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "  Total de migrations: $migrationCount" -ForegroundColor White
Write-Host "  Sucesso: $successCount" -ForegroundColor Green
Write-Host "  Erros: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host "=======================================" -ForegroundColor Cyan

if ($errorCount -eq 0) {
    Write-Host "`nTodas as migrations foram executadas com sucesso!" -ForegroundColor Green
    Write-Host "`nPara verificar as tabelas criadas, execute:" -ForegroundColor Cyan
    Write-Host "  mysql -u $mysqlUser -p -h $mysqlHost -P $mysqlPort $dbName -e 'SHOW TABLES;'" -ForegroundColor White
} else {
    Write-Host "`nAlgumas migrations falharam. Verifique os erros acima." -ForegroundColor Yellow
}

# Limpar senha da memória
$mysqlPassPlain = $null
$mysqlPass = $null

