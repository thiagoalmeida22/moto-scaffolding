import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js'
import { normalizeValue, normalizeNumeric } from '@/utils/valueHelpers.js'

export async function POST(request) {
    try {
        const motoForm = await request.json();
        const sql = `
            INSERT INTO motos.motos (modelo, marca,  ano, categoria, codigo_fipe,  preco_fipe,  tipo_motor,   cilindrada,   potencia_A,   potencia_G,   torque_A, 
            torque_G,   partida,  refrigeracao,    cambio,   embreagem,    suspensao_d,   suspensao_t,  tipo_freio,  freio_d, freio_t,    
            pneu_d,    pneu_t,    chassi,    alt_assento,   altura,   comprimento,  largura, dist_eixos, peso,   cap_carga,    vel_max,
            acel_100, combustivel,    consumo_A, consumo_G,  autonomia_A, autonomia_G,    tanque,    aditional)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            normalizeValue(motoForm.modelo), 
            normalizeNumeric(motoForm.marca), 
            normalizeNumeric(motoForm.ano), 
            normalizeValue(motoForm.categoria), 
            normalizeValue(motoForm.codigo_fipe),
            normalizeNumeric(motoForm.preco_fipe), 
            normalizeValue(motoForm.tipo_motor), 
            normalizeNumeric(motoForm.cilindrada),
            normalizeValue(motoForm.potencia_A), 
            normalizeValue(motoForm.potencia_G), 
            normalizeValue(motoForm.torque_A), 
            normalizeValue(motoForm.torque_G), 
            normalizeValue(motoForm.partida), 
            normalizeValue(motoForm.refrigeracao), 
            normalizeValue(motoForm.cambio),
            normalizeValue(motoForm.embreagem), 
            normalizeValue(motoForm.suspensao_d), 
            normalizeValue(motoForm.suspensao_t), 
            normalizeValue(motoForm.tipo_freio), 
            normalizeValue(motoForm.freio_d), 
            normalizeValue(motoForm.freio_t), 
            normalizeValue(motoForm.pneu_d),
            normalizeValue(motoForm.pneu_t), 
            normalizeValue(motoForm.chassi), 
            normalizeNumeric(motoForm.alt_assento), 
            normalizeNumeric(motoForm.altura), 
            normalizeNumeric(motoForm.comprimento), 
            normalizeNumeric(motoForm.largura), 
            normalizeNumeric(motoForm.dist_eixos),
            normalizeNumeric(motoForm.peso), 
            normalizeNumeric(motoForm.cap_carga), 
            normalizeNumeric(motoForm.vel_max), 
            normalizeNumeric(motoForm.acel_100), 
            normalizeValue(motoForm.combustivel), 
            normalizeNumeric(motoForm.consumo_A), 
            normalizeNumeric(motoForm.consumo_G),
            normalizeNumeric(motoForm.autonomia_A), 
            normalizeNumeric(motoForm.autonomia_G), 
            normalizeNumeric(motoForm.tanque), 
            normalizeValue(motoForm.aditional)
        ];

        const [results] = await dbPool.query(sql, values);

        return NextResponse.json({
            message: 'Moto created successfully!',
            id: results.insertId
        }, { status: 200 });
    } catch (error) {
        console.error('Error creating moto:', error);
        return NextResponse.json({ message: 'Error creating moto', error: error.message }, { status: 500 });
    }
}