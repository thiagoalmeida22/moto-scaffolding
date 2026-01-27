import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js'

export async function POST(request) {
    try {
        const motoForm = await request.json();
        const sql = `
            INSERT INTO motos (modelo, marca,  ano, categoria,  preco_fipe,  tipo_motor,   cilindrada,   potencia_A,   potencia_G,   torque_A, 
            torque_G,   partida,  refrigeracao,    cambio,   embreagem,    suspensao_d,   suspensao_t,  tipo_freio,  freio_d, freio_t,    
            pneu_d,    pneu_t,    chassi,    alt_assento,   altura,   comprimento,  largura, dist_eixos, peso,   cap_carga,    vel_max,
            acel_100, combustivel,    consumo_A, consumo_G,  autonomia_A, autonomia_G,    tanque,    aditional)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            motoForm.modelo, motoForm.marca, motoForm.ano, motoForm.categoria, motoForm.preco_fipe, motoForm.tipo_motor, motoForm.cilindrada,
            motoForm.potencia_A, motoForm.potencia_G, motoForm.torque_A, motoForm.torque_G, motoForm.partida, motoForm.refrigeracao, motoForm.cambio,
            motoForm.embreagem, motoForm.suspensao_d, motoForm.suspensao_t, motoForm.tipo_freio, motoForm.freio_d, motoForm.freio_t, motoForm.pneu_d,
            motoForm.pneu_t, motoForm.chassi, motoForm.alt_assento, motoForm.altura, motoForm.comprimento, motoForm.largura, motoForm.dist_eixos,
            motoForm.peso, motoForm.cap_carga, motoForm.vel_max, motoForm.acel_100, motoForm.combustivel, motoForm.consumo_A, motoForm.consumo_G,
            motoForm.autonomia_A, motoForm.autonomia_G, motoForm.tanque, motoForm.aditional
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