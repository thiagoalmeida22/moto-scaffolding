import dbPool from '@/utils/database.js'

export async function GET(request, { params }) {
    const { modelo } = await params;
    try {
        const [results, fields] = await dbPool.query(`
            SELECT DISTINCT ano
            FROM motos.motos WHERE \`modelo\` = ?;
            `,
            [modelo]);
        return Response.json(results);
    } catch (err) {
        console.log(err);
    }
}