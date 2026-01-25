import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env files (only in development)
// In production, variables come from docker-compose env_file
if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

// Função para validar variáveis de ambiente
function validateConfig(config, envType) {
	const required = ['host', 'user', 'password', 'database'];
	const missing = required.filter(key => !config[key] || config[key].trim() === '');
	
	if (missing.length > 0) {
		console.error(`[DB ERROR] Variáveis de ambiente faltando para ${envType}:`, missing);
		console.error('[DB ERROR] Config recebida:', {
			host: config.host || 'UNDEFINED',
			user: config.user || 'UNDEFINED',
			password: config.password ? '***' : 'UNDEFINED',
			database: config.database || 'UNDEFINED',
		});
		throw new Error(`Variáveis de ambiente do banco de dados faltando: ${missing.join(', ')}`);
	}
}

// Função para criar configuração do banco
function createConfig() {
	const isProduction = process.env.NODE_ENV === 'production';
	
	const config = isProduction
		? {
			host: process.env.PROD_DB_HOST,
			user: process.env.PROD_DB_USER,
			password: process.env.PROD_DB_PASS,
			database: process.env.PROD_DB_NAME,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
			// Configurações adicionais para melhor estabilidade
			enableKeepAlive: true,
			keepAliveInitialDelay: 0,
			// Timeout para conexões
			connectTimeout: 10000,
		}
		: {
			host: process.env.LOCAL_DB_HOST,
			user: process.env.LOCAL_DB_USER,
			password: process.env.LOCAL_DB_PASS,
			database: process.env.LOCAL_DB_NAME,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
			enableKeepAlive: true,
			keepAliveInitialDelay: 0,
			connectTimeout: 10000,
		};

	validateConfig(config, isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
	return config;
}

// Função para testar a conexão
async function testConnection(pool) {
	try {
		const connection = await pool.getConnection();
		await connection.ping();
		connection.release();
		return true;
	} catch (error) {
		console.error('[DB ERROR] Erro ao testar conexão:', error.message);
		return false;
	}
}

// Criar pool de conexões
let dbPool;

if (!global._dbPool) {
	try {
		const config = createConfig();
		console.log('[DB] Criando pool de conexões...');
		console.log('[DB] Configuração:', {
			host: config.host,
			user: config.user,
			database: config.database,
			env: process.env.NODE_ENV,
		});
		
		global._dbPool = mysql.createPool(config);
		
		// Testar conexão após criar o pool
		const isConnected = await testConnection(global._dbPool);
		if (isConnected) {
			console.log('[DB] ✅ Pool de conexões criado e testado com sucesso!');
		} else {
			console.error('[DB] ⚠️ Pool criado mas conexão inicial falhou. Tentando novamente em 5s...');
			// Aguardar 5 segundos e tentar novamente
			setTimeout(async () => {
				const retryConnected = await testConnection(global._dbPool);
				if (retryConnected) {
					console.log('[DB] ✅ Conexão estabelecida após retry!');
				} else {
					console.error('[DB] ❌ Falha na conexão após retry. Verifique as configurações.');
				}
			}, 5000);
		}
		
		// Adicionar handler de erro no pool
		global._dbPool.on('error', (err) => {
			console.error('[DB ERROR] Erro no pool de conexões:', err);
			if (err.code === 'PROTOCOL_CONNECTION_LOST') {
				console.error('[DB ERROR] Conexão com MySQL perdida. Reconectando...');
			}
		});
		
	} catch (error) {
		console.error('[DB ERROR] Erro ao criar pool de conexões:', error.message);
		throw error;
	}
}

dbPool = global._dbPool;

export default dbPool;