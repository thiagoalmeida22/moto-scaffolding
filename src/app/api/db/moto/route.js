import dbPool from '@/utils/database.js'

export async function GET(request, { params }) {
    const searchParams = request.nextUrl.searchParams
    const modelo = searchParams.get('modelo');
    const ano = searchParams.get('ano');
    try {
        const [results, fields] = await dbPool.query(`
            SELECT m.modelo, Marcas.nome AS marca, m.ano, m.cilindrada, m.potencia, m.torque, m.transmissao, m.partida, m.combustivel, m.tanque, m.chassi, m.freio_d, m.freio_t, m.pneu_d, m.pneu_t, m.peso_seco, m.peso_odm
            FROM motos.Motos AS m
            JOIN Marcas ON m.marca = Marcas.id
            WHERE m.modelo = ? AND m.ano = ?;
            `,
            [modelo, ano]);
        return Response.json(results[0]);
    } catch (err) {
        console.log(err);
    }
}