import dbPool from '@/utils/database.js'

export async function POST(request) {
    const { marca } = await request.json();
    try {
        const [results, fields] = await dbPool.query(`
            INSERT INTO Marcas (nome) 
            VALUES (?);
            `,
            [marca]);
        return Response.json(results);
    } catch (err) {
        console.log(err);
    }
}