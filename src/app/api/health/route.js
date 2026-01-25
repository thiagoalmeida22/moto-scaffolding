import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'moto-scaffolding',
    database: {
      status: 'unknown',
      message: '',
    },
  };

  // Testar conexão com o banco de dados
  try {
    const connection = await dbPool.getConnection();
    await connection.ping();
    connection.release();
    health.database.status = 'connected';
    health.database.message = 'Conexão com MySQL estabelecida';
  } catch (error) {
    health.status = 'degraded';
    health.database.status = 'disconnected';
    health.database.message = error.message || 'Erro ao conectar com MySQL';
    health.database.error = error.code || 'UNKNOWN_ERROR';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}

