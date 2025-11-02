import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const motoId = searchParams.get('motoId');

        if (!motoId) {
            return NextResponse.json(
                { error: 'motoId é obrigatório' },
                { status: 400 }
            );
        }

        // Buscar fotos da moto ordenadas por ordem
        const [fotos] = await dbPool.query(
            'SELECT foto_path, ordem FROM motos.MotoFotos WHERE moto_id = ? ORDER BY ordem ASC',
            [motoId]
        );

        return NextResponse.json({
            success: true,
            fotos: fotos || []
        });

    } catch (error) {
        console.error('Erro ao buscar fotos:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar fotos', details: error.message },
            { status: 500 }
        );
    }
}

