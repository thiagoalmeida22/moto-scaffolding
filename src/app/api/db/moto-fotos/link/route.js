import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js';

export async function POST(request) {
    try {
        const body = await request.json();
        const { motoId, fotoPaths } = body;

        if (!motoId || !fotoPaths || !Array.isArray(fotoPaths)) {
            return NextResponse.json(
                { error: 'motoId e fotoPaths são obrigatórios' },
                { status: 400 }
            );
        }

        if (fotoPaths.length > 3) {
            return NextResponse.json(
                { error: 'Máximo de 3 fotos por moto' },
                { status: 400 }
            );
        }

        // Buscar descrições existentes das fotos antes de remover
        const placeholders = fotoPaths.map(() => '?').join(',');
        const [descricoesExistentes] = await dbPool.query(
            `SELECT foto_path, descricao FROM motos.MotoFotos WHERE foto_path IN (${placeholders})`,
            fotoPaths
        );
        
        const descricoesMap = {};
        descricoesExistentes.forEach(row => {
            descricoesMap[row.foto_path] = row.descricao;
        });

        // Remover fotos existentes da moto
        await dbPool.query(
            'DELETE FROM motos.MotoFotos WHERE moto_id = ?',
            [motoId]
        );

        // Inserir novas fotos preservando descrições existentes
        if (fotoPaths.length > 0) {
            const values = fotoPaths.map((fotoPath, index) => [
                motoId, 
                fotoPath, 
                index, 
                descricoesMap[fotoPath] || null
            ]);
            await dbPool.query(
                'INSERT INTO motos.MotoFotos (moto_id, foto_path, ordem, descricao) VALUES ?',
                [values]
            );
        }

        return NextResponse.json({
            success: true,
            message: fotoPaths.length === 0 
                ? 'Todas as fotos foram removidas com sucesso' 
                : `${fotoPaths.length} foto(s) linkada(s) com sucesso`
        });

    } catch (error) {
        console.error('Erro ao linkar fotos:', error);
        return NextResponse.json(
            { error: 'Erro ao linkar fotos', details: error.message },
            { status: 500 }
        );
    }
}

