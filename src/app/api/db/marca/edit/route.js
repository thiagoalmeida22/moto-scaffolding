import dbPool from '@/utils/database.js'
import { normalizeValue, normalizeNumeric } from '@/utils/valueHelpers.js'

export async function PUT(request) {
    const { id, marca } = await request.json();
    console.log(id, marca);
    try {
        const [results, fields] = await dbPool.query(`
            UPDATE motos.marcas 
            SET nome = ? 
            WHERE id = ?;
            `,
            [normalizeValue(marca), normalizeNumeric(id)]);
        return Response.json(results);
    } catch (err) {
        console.log(err);
    }
}