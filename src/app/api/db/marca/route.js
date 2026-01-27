import dbPool from '@/utils/database.js'

export async function GET(request, { params }) {
    try {
        const [results, fields] = await dbPool.query(
            `SELECT id, nome
            FROM motos.marcas; `
        );
        return Response.json(results);
    } catch (err) {
        console.error('Database error:', err);
        return Response.json(
            { error: 'Database connection failed', details: err.message },
            { status: 500 }
        );
    }
}