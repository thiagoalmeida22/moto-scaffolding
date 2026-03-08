import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js';
import { normalizeValue, normalizeNumeric } from '@/utils/valueHelpers.js';

export async function POST(request) {
    try {
        const { motoId, targetYear } = await request.json();

        if (!motoId || !targetYear) {
            return NextResponse.json(
                { success: false, message: 'motoId e targetYear são obrigatórios' },
                { status: 400 }
            );
        }

        const targetYearNum = parseInt(targetYear, 10);
        if (targetYearNum < 2000 || targetYearNum > 2030) {
            return NextResponse.json(
                { success: false, message: 'O ano deve estar entre 2000 e 2030' },
                { status: 400 }
            );
        }

        // Buscar a moto original
        const [motoRows] = await dbPool.query(
            'SELECT * FROM motos.motos WHERE id = ?',
            [motoId]
        );

        if (!motoRows || motoRows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Moto não encontrada' },
                { status: 404 }
            );
        }

        const sourceMoto = motoRows[0];

        // Verificar se modelo+ano já existe
        const [existingRows] = await dbPool.query(
            'SELECT id FROM motos.motos WHERE modelo = ? AND ano = ?',
            [sourceMoto.modelo, targetYearNum]
        );

        if (existingRows && existingRows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Já existe uma moto "${sourceMoto.modelo}" para o ano ${targetYearNum}. Escolha outro ano.`
                },
                { status: 409 }
            );
        }

        // Inserir nova moto (cópia sem linkagem de fotos)
        const sql = `
            INSERT INTO motos.motos (modelo, marca, ano, categoria, codigo_fipe, preco_fipe, tipo_motor, cilindrada, potencia_A, potencia_G, torque_A, 
            torque_G, partida, refrigeracao, cambio, embreagem, suspensao_d, suspensao_t, tipo_freio, freio_d, freio_t, 
            pneu_d, pneu_t, chassi, alt_assento, altura, comprimento, largura, dist_eixos, peso, cap_carga, vel_max,
            acel_100, combustivel, consumo_A, consumo_G, autonomia_A, autonomia_G, tanque, aditional)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            normalizeValue(sourceMoto.modelo),
            normalizeNumeric(sourceMoto.marca),
            targetYearNum,
            normalizeValue(sourceMoto.categoria),
            normalizeValue(sourceMoto.codigo_fipe),
            normalizeNumeric(sourceMoto.preco_fipe),
            normalizeValue(sourceMoto.tipo_motor),
            normalizeNumeric(sourceMoto.cilindrada),
            normalizeValue(sourceMoto.potencia_A),
            normalizeValue(sourceMoto.potencia_G),
            normalizeValue(sourceMoto.torque_A),
            normalizeValue(sourceMoto.torque_G),
            normalizeValue(sourceMoto.partida),
            normalizeValue(sourceMoto.refrigeracao),
            normalizeValue(sourceMoto.cambio),
            normalizeValue(sourceMoto.embreagem),
            normalizeValue(sourceMoto.suspensao_d),
            normalizeValue(sourceMoto.suspensao_t),
            normalizeValue(sourceMoto.tipo_freio),
            normalizeValue(sourceMoto.freio_d),
            normalizeValue(sourceMoto.freio_t),
            normalizeValue(sourceMoto.pneu_d),
            normalizeValue(sourceMoto.pneu_t),
            normalizeValue(sourceMoto.chassi),
            normalizeNumeric(sourceMoto.alt_assento),
            normalizeNumeric(sourceMoto.altura),
            normalizeNumeric(sourceMoto.comprimento),
            normalizeNumeric(sourceMoto.largura),
            normalizeNumeric(sourceMoto.dist_eixos),
            normalizeNumeric(sourceMoto.peso),
            normalizeNumeric(sourceMoto.cap_carga),
            normalizeNumeric(sourceMoto.vel_max),
            normalizeNumeric(sourceMoto.acel_100),
            normalizeValue(sourceMoto.combustivel),
            normalizeNumeric(sourceMoto.consumo_A),
            normalizeNumeric(sourceMoto.consumo_G),
            normalizeNumeric(sourceMoto.autonomia_A),
            normalizeNumeric(sourceMoto.autonomia_G),
            normalizeNumeric(sourceMoto.tanque),
            normalizeValue(sourceMoto.aditional)
        ];

        const [results] = await dbPool.query(sql, values);

        return NextResponse.json({
            success: true,
            message: `Moto duplicada com sucesso para o ano ${targetYearNum}. A nova moto não possui fotos linkadas.`,
            id: results.insertId
        }, { status: 200 });
    } catch (error) {
        console.error('Error duplicating moto:', error);
        return NextResponse.json(
            { success: false, message: 'Erro ao duplicar moto', error: error.message },
            { status: 500 }
        );
    }
}
