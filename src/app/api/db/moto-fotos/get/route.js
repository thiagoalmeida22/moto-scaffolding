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

        // Buscar fotos da moto ordenadas por ordem (com JOIN na tabela Fotos)
        const [fotos] = await dbPool.query(
            `SELECT f.foto_path, mf.ordem 
             FROM motos.motofotos mf
             INNER JOIN motos.fotos f ON mf.foto_id = f.id
             WHERE mf.moto_id = ? 
             ORDER BY mf.ordem ASC`,
            [motoId]
        );

        // Converter caminhos do banco (/pictures/...) para formato da API (/api/pictures/...)
        const fotosFormatadas = fotos.map(foto => ({
            foto_path: foto.foto_path.startsWith('/pictures/')
                ? foto.foto_path.replace('/pictures/', '/api/pictures/')
                : foto.foto_path,
            ordem: foto.ordem
        }));

        return NextResponse.json({
            success: true,
            fotos: fotosFormatadas || []
        });

    } catch (error) {
        console.error('Erro ao buscar fotos:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar fotos', details: error.message },
            { status: 500 }
        );
    }
}

