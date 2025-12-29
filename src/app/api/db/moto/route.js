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
        // return Response.json(results[0]);
        console.log(results[0]);
        return Response.json({
            id: results[0].id,
            'Especificacoes': {
                'Modelo': results[0].modelo,
                'Marca': results[0].marca,
                'Ano': results[0].ano,
                'Categoria': results[0].categoria,
                'Preço Fipe': results[0].preco_fipe
            },
            'Motor': {
                'Tipo': results[0].tipo_motor,
                'Cilindrada': results[0].cilindrada,
                'Potencia (Gasolina)': results[0].potencia_G,
                'Potencia (Alcool)': results[0].potencia_A,
                'Torque (Gasolina)': results[0].torque_G,
                'Torque (Alcool)': results[0].torque_A,
                'Partida': results[0].partida,
                'Refrigeração': results[0].refrigeracao
            },
            'Transmissão': {
                'Cambio': results[0].cambio,
                'Embreagem': results[0].embreagem
            },
            'Suspensão': {
                'Dianteira': results[0].suspensao_d,
                'Traseira': results[0].suspensao_t
            },
            'Freio': {
                'Tipo': results[0].tipo_freio,
                'Dianteiro': results[0].freio_d,
                'Traseiro': results[0].freio_t
            },
            'Pneu': {
                'Dianteiro': results[0].pneu_d,
                'Traseiro': results[0].pneu_t
            },
            'Dimensoes': {
                'Tipo de Chassi': results[0].chassi,
                'Altura do Assento': results[0].alt_assento,
                'Altura': results[0].altura,
                'Comprimento': results[0].comprimento,
                'Largura': results[0].largura,
                'Distância entre Eixos': results[0].dist_eixos,
                'Peso': results[0].peso,
                'Capacidade de Carga': results[0].cap_carga,
            },
            'Desempenho': {
                'Velocidade Máxima': results[0].vel_max,
                'Aceleração 0-100': results[0].acel_100,
            },
            'Combustível': {
                'Tipo': results[0].combustivel,
                'Consumo (Gasolina)': results[0].consumo_G,
                'Consumo (Alcool)': results[0].consumo_A,
                'Autonomia (Gasolina)': results[0].autonomia_G,
                'Autonomia (Alcool)': results[0].autonomia_A,
                'Tanque': results[0].tanque,
            },
            'Extras': results[0].aditional && results[0].aditional.trim() !== '' 
                ? JSON.parse(results[0].aditional) 
                : {},
        });
    } catch (err) {
        console.log(err);
        return Response.json({ error: 'Erro ao buscar dados da moto' }, { status: 500 });
    }
}