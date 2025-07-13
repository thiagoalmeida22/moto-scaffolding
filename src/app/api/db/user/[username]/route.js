import dbPool from '@/utils/database.js'

export async function GET(request, { params }) {
    // Await the params before destructuring
    const { username } = await params;
    console.log("Received username:", username);
    try {
        const [results, fields] = await dbPool.query(`
            SELECT *
            FROM motos.Users 
            WHERE \`user\` = ? LIMIT 1;
            `,
            [username]
        );
        return Response.json(results[0]);
    } catch (err) {
        console.error(err);
        return Response.error();
    }
}