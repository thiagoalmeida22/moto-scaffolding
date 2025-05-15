import dbPool from '@/utils/database.js'

export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const [results, fields] = await dbPool.query(`
            SELECT DISTINCT modelo
            FROM motos.Motos WHERE \`marca\` = ?;
            `,
            [id]);
        return Response.json(results);
    } catch (err) {
        console.log(err);
    }
}