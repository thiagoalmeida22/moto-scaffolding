import { NextResponse } from 'next/server';
import dbPool from '@/utils/database.js';

export async function PUT(request) {
    try {
        const body = await request.json();
        const { foto_path, descricao } = body;

        if (!foto_path) {
            return NextResponse.json(
                { error: 'foto_path é obrigatório' },
                { status: 400 }
            );
        }

        // Validar tamanho da descrição (máximo 20 caracteres)
        if (descricao && descricao.length > 20) {
            return NextResponse.json(
                { error: 'Descrição deve ter no máximo 20 caracteres' },
                { status: 400 }
            );
        }

        // Normalizar caminho: remover /api se existir
        const normalizedPath = foto_path.startsWith('/api/pictures/') 
            ? foto_path.replace('/api/pictures/', '/pictures/')
            : foto_path.startsWith('/pictures/')
            ? foto_path
            : `/pictures/${foto_path}`;

        // Atualizar descrição na tabela Fotos
        // Se a foto não existir, criar uma entrada sem descrição
        await dbPool.query(
            `INSERT INTO motos.Fotos (foto_path, descricao) 
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE descricao = VALUES(descricao)`,
            [normalizedPath, descricao || null]
        );

        return NextResponse.json({
            success: true,
            message: 'Descrição atualizada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar descrição:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar descrição', details: error.message },
            { status: 500 }
        );
    }
}

