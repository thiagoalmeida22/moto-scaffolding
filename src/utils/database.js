import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env files
dotenv.config();

const config =
	process.env.NODE_ENV === 'production'
		? {
			host: process.env.PROD_DB_HOST,
			user: process.env.PROD_DB_USER,
			password: process.env.PROD_DB_PASS,
			database: process.env.PROD_DB_NAME,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
		}
		: {
			host: process.env.LOCAL_DB_HOST,
			user: process.env.LOCAL_DB_USER,
			password: process.env.LOCAL_DB_PASS,
			database: process.env.LOCAL_DB_NAME,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
		};

if (!global._dbPool) {
	global._dbPool = mysql.createPool(config);
	console.log('Conexão com DB realizado com sucesso!');
}

const dbPool = global._dbPool;

export default dbPool;