import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import dbPool from '@/utils/database.js';

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const fotoPath = searchParams.get('fotoPath');

        if (!fotoPath) {
            return NextResponse.json(
                { error: 'fotoPath é obrigatório' },
                { status: 400 }
            );
        }

        // Converter o caminho da API para o caminho físico do arquivo
        let filePath;
        
        if (fotoPath.startsWith('/api/pictures/')) {
            // Remover /api/pictures/ e construir o caminho relativo ao projeto
            const relativePath = fotoPath.replace('/api/pictures/', '');
            filePath = path.join(process.cwd(), 'pictures', relativePath);
        } else if (fotoPath.startsWith('pictures/')) {
            filePath = path.join(process.cwd(), fotoPath);
        } else {
            filePath = path.join(process.cwd(), 'pictures', fotoPath);
        }

        // Deletar o arquivo físico
        if (existsSync(filePath)) {
            await unlink(filePath);
        } else {
            console.warn(`Arquivo não encontrado: ${filePath}`);
        }

        // Remover todas as referências dessa foto no banco de dados
        // Usar o nome do arquivo para garantir que todas as referências sejam removidas
        const fileName = path.basename(fotoPath);
        
        // Deletar todas as entradas que terminam com o nome do arquivo
        await dbPool.query(
            'DELETE FROM motos.MotoFotos WHERE foto_path LIKE ?',
            [`%${fileName}`]
        );

        return NextResponse.json({
            success: true,
            message: 'Foto deletada com sucesso e deslinkada de todas as motos'
        });

    } catch (error) {
        console.error('Erro ao deletar foto:', error);
        return NextResponse.json(
            { error: 'Erro ao deletar foto', details: error.message },
            { status: 500 }
        );
    }
}

