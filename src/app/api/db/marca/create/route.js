import dbPool from '@/utils/database.js'
import { normalizeValue } from '@/utils/valueHelpers.js'

export async function POST(request) {
    const { marca } = await request.json();
    try {
        const [results, fields] = await dbPool.query(`
            INSERT INTO motos.marcas (nome) 
            VALUES (?);
            `,
            [normalizeValue(marca)]);
        return Response.json(results);
    } catch (err) {
        console.log(err);
    }
}