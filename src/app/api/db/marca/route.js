import dbPool from '@/utils/database.js'

export async function GET(request, { params }) {
    try {
        const [results, fields] = await dbPool.query(
            `SELECT id, nome
            FROM motos.Marcas; `
        );
        return Response.json(results);
    } catch (err) {
        console.log(err);
    }
}