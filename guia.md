-=-=-=-=-=-=-=-=-= DEPLOY -=-=-=-=-=-=-=-=-=-=-=-=-=-
cd /opt/moto-scaffolding
Pode usar o cript update.sh. (./scripts/update.sh)
Pode aceitar o mysqlDump geral.
Para copiar o dump da VPS para sua maquina local use:
scp root@168.231.89.50:/opt/moto-scaffolding/backup_20260125_215537.sql .
scp root@[IP_AQUI_PODE_MUDAR]/opt/moto-scaffolding/backup_20260125_215537.sql .
Para descobir o IP da VPS, use o comando:
hostname -I
Deve voltar algo como:
168.231.89.50 172.17.0.1 172.18.0.1 2a02:4780:14:b4a9::1 (O ip é o primeiro valor)
A senha root da vps é:
@Th2723272312car
Utilizei essa senha pq precisa um minimo de 12 caracteres

-=-=-=-=-=-=-=-= mySQLdump Script -=-=-=-=-=-=-=-=-=-=-=-
chmod +x /opt/moto-scaffolding/scripts/export-motos-utf8-direct.sh
cd /opt/moto-scaffolding
./scripts/export-motos-utf8-direct.sh -TableName "Motos" -MigrationNumber "021"
./scripts/export-motos-utf8-direct.sh -TableName "[NOME_TABELA_AQUI]" -MigrationNumber "[NUMERO_AQ]"
A senha que funcionou foi a do PROD_DB_PASS, ultima vez que usei era essa senha abaixo:
Frozenjw022
Depois para exportar algum comando como:
scp root@168.231.89.50:/opt/moto-scaffolding/migrations/021_populate_motos_table.sql .
scp root@[IP_AQUI_PODE_MUDAR]/opt/moto-scaffolding/migrations/[NOME_ARQUIVO_PODE_MUDAR] .