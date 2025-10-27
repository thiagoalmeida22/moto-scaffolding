import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import dbPool from '@/utils/database.js';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const marcaId = searchParams.get('marca');
        const modelo = searchParams.get('modelo');

        if (!marcaId || !modelo) {
            return NextResponse.json(
                { error: 'Marca e Modelo são obrigatórios' },
                { status: 400 }
            );
        }

        // Buscar o nome da marca
        const [marcaResults] = await dbPool.query(
            'SELECT nome FROM motos.Marcas WHERE id = ?',
            [marcaId]
        );

        if (!marcaResults || marcaResults.length === 0) {
            return NextResponse.json(
                { error: 'Marca não encontrada' },
                { status: 404 }
            );
        }

        const marcaNome = marcaResults[0].nome;

        // Sanitizar nomes de pastas
        const sanitizeFolderName = (name) => {
            return name.replace(/[^a-zA-Z0-9_-]/g, '_').trim();
        };

        const sanitizedMarcaNome = sanitizeFolderName(marcaNome);
        const sanitizedModelo = sanitizeFolderName(modelo);

        // Caminho da pasta de fotos
        const fotoDir = path.join(process.cwd(), 'pictures', sanitizedMarcaNome, sanitizedModelo);

        // Listar fotos disponíveis
        const fotos = [];
        if (existsSync(fotoDir)) {
            const files = await readdir(fotoDir);
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            
            // Buscar todas as descrições das fotos deste modelo na tabela MotoFotos
            const [descricoes] = await dbPool.query(
                `SELECT foto_path, descricao FROM motos.MotoFotos 
                 WHERE foto_path LIKE ?`,
                [`%/pictures/${sanitizedMarcaNome}/${sanitizedModelo}/%`]
            );
            
            // Criar um mapa de foto_path -> descricao
            const descricoesMap = {};
            descricoes.forEach(row => {
                descricoesMap[row.foto_path] = row.descricao || '';
            });
            
            files.forEach((file) => {
                const ext = path.extname(file).toLowerCase();
                if (imageExtensions.includes(ext)) {
                    const fotoPath = `/api/pictures/${sanitizedMarcaNome}/${sanitizedModelo}/${file}`;
                    // Buscar descrição da foto se existir na tabela
                    const fotoDbPath = `/pictures/${sanitizedMarcaNome}/${sanitizedModelo}/${file}`;
                    const descricao = descricoesMap[fotoDbPath] || '';
                    
                    fotos.push({
                        filename: file,
                        path: fotoPath,
                        fullPath: path.join(fotoDir, file),
                        descricao: descricao || ''
                    });
                }
            });
        }

        return NextResponse.json({
            success: true,
            fotos: fotos,
            marca: marcaNome,
            modelo: modelo
        });

    } catch (error) {
        console.error('Erro ao listar fotos:', error);
        return NextResponse.json(
            { error: 'Erro ao listar fotos', details: error.message },
            { status: 500 }
        );
    }
}

