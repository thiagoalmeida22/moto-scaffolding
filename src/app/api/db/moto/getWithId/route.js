import dbPool from '@/utils/database.js'

export async function GET(request, { params }) {
    const searchParams = request.nextUrl.searchParams
    const modelo = searchParams.get('modelo');
    const ano = searchParams.get('ano');
    try {
        const [results, fields] = await dbPool.query(`
            SELECT m.id, m.modelo, Marcas.nome AS marca, m.ano, m.categoria, m.preco_fipe, m.tipo_motor, m.cilindrada, m.potencia_A, m.potencia_G, m.torque_A, 
            m.torque_G, m.partida, m.refrigeracao, m.cambio, m.embreagem, m.suspensao_d, m.suspensao_t, m.tipo_freio, m.freio_d, m.freio_t, m.pneu_d, 
            m.pneu_t, m.chassi, m.alt_assento, m.altura, m.comprimento, m.largura, m.dist_eixos, m.peso, m.cap_carga, m.vel_max, m.acel_100, m.combustivel, 
            m.consumo_A, m.consumo_G, m.autonomia_A, m.autonomia_G, m.tanque, m.aditional
            FROM motos.Motos AS m
            JOIN Marcas ON m.marca = Marcas.id
            WHERE m.modelo = ? 
              AND m.ano = ?;
            `,
            [modelo, ano]);
        return Response.json(results[0]);
    } catch (err) {
        console.log(err);
    }
}