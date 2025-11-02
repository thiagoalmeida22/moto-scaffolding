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

        // Usar INSERT ... ON DUPLICATE KEY UPDATE para inserir ou atualizar
        // Permite salvar descrição mesmo sem moto_id associado
        await dbPool.query(
            `INSERT INTO motos.MotoFotos (foto_path, descricao) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE descricao = VALUES(descricao)`,
            [foto_path, descricao || null]
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

