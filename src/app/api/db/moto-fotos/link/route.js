import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js';
import { normalizeNumeric } from '@/utils/valueHelpers.js';

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

        // Normalizar caminhos: remover /api se existir
        const normalizedPaths = fotoPaths.map(path => 
            path.startsWith('/api/pictures/') 
                ? path.replace('/api/pictures/', '/pictures/')
                : path.startsWith('/pictures/')
                ? path
                : `/pictures/${path}`
        );

        // Primeiro, garantir que todas as fotos existam na tabela Fotos
        for (const fotoPath of normalizedPaths) {
            await dbPool.query(
                `INSERT INTO motos.fotos (foto_path, descricao) 
                 VALUES (?, NULL)
                 ON DUPLICATE KEY UPDATE foto_path = foto_path`,
                [fotoPath]
            );
        }

        // Buscar os IDs das fotos na tabela Fotos
        let fotos = [];
        if (normalizedPaths.length > 0) {
            const placeholders = normalizedPaths.map(() => '?').join(',');
            const [fotosRows] = await dbPool.query(
                `SELECT id, foto_path FROM motos.fotos WHERE foto_path IN (${placeholders})`,
                normalizedPaths
            );
            fotos = fotosRows;
        }

        // Criar mapa de foto_path -> foto_id
        const fotoIdMap = {};
        fotos.forEach(foto => {
            fotoIdMap[foto.foto_path] = foto.id;
        });

        // Buscar fotos atualmente vinculadas à moto
        const [fotosExistentes] = await dbPool.query(
            'SELECT foto_id, ordem FROM motos.motofotos WHERE moto_id = ?',
            [normalizeNumeric(motoId)]
        );

        // Criar mapa de foto_id -> ordem atual
        const ordemAtualMap = {};
        fotosExistentes.forEach(foto => {
            ordemAtualMap[foto.foto_id] = foto.ordem;
        });

        // Processar cada foto na nova ordem
        const fotoIds = normalizedPaths.map(path => fotoIdMap[path]).filter(id => id !== undefined);
        
        // Atualizar ordem das fotos existentes e inserir novas
        for (let index = 0; index < fotoIds.length; index++) {
            const fotoId = fotoIds[index];
            const ordemAtual = ordemAtualMap[fotoId];

            if (ordemAtual !== undefined) {
                // Foto já existe: apenas atualizar a ordem
                if (ordemAtual !== index) {
                    await dbPool.query(
                        'UPDATE motos.motofotos SET ordem = ? WHERE moto_id = ? AND foto_id = ?',
                        [normalizeNumeric(index), normalizeNumeric(motoId), normalizeNumeric(fotoId)]
                    );
                }
            } else {
                // Foto não existe: inserir nova
                await dbPool.query(
                    'INSERT INTO motos.motofotos (moto_id, foto_id, ordem) VALUES (?, ?, ?)',
                    [normalizeNumeric(motoId), normalizeNumeric(fotoId), normalizeNumeric(index)]
                );
            }
        }

        // Remover fotos que não estão mais na lista
        if (fotoIds.length > 0) {
            const normalizedFotoIds = fotoIds.map(id => normalizeNumeric(id));
            const fotoIdsPlaceholders = normalizedFotoIds.map(() => '?').join(',');
            await dbPool.query(
                `DELETE FROM motos.motofotos 
                 WHERE moto_id = ? AND foto_id NOT IN (${fotoIdsPlaceholders})`,
                [normalizeNumeric(motoId), ...normalizedFotoIds]
            );
        } else {
            // Se não há fotos, remover todas
            await dbPool.query(
                'DELETE FROM motos.motofotos WHERE moto_id = ?',
                [normalizeNumeric(motoId)]
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

