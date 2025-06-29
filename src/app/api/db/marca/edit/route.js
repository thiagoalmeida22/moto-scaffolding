import dbPool from '@/utils/database.js'

export async function PUT(request) {
    const { id, marca } = await request.json();
    console.log(id, marca);
    try {
        const [results, fields] = await dbPool.query(`
            UPDATE Marcas 
            SET nome = ? 
            WHERE id = ?;
            `,
            [marca, id]);
        return Response.json(results);
    } catch (err) {
        console.log(err);
    }
}