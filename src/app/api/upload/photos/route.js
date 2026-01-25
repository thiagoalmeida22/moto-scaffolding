import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import dbPool from '@/utils/database.js';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const marca = formData.get('marca');
        const modelo = formData.get('modelo');
        const photos = formData.getAll('photos');

        if (!marca || !modelo) {
            return NextResponse.json(
                { error: 'Marca e Modelo são obrigatórios' },
                { status: 400 }
            );
        }

        if (!photos || photos.length === 0) {
            return NextResponse.json(
                { error: 'Nenhuma foto foi enviada' },
                { status: 400 }
            );
        }

        // Buscar o nome da marca do banco de dados
        const [marcaResults] = await dbPool.query(
            'SELECT nome FROM motos.Marcas WHERE id = ?',
            [marca]
        );
        
        if (!marcaResults || marcaResults.length === 0) {
            return NextResponse.json(
                { error: 'Marca não encontrada' },
                { status: 404 }
            );
        }

        const marcaNome = marcaResults[0].nome;
        
        // Sanitizar nomes de pastas (remover caracteres especiais)
        const sanitizeFolderName = (name) => {
            return name.replace(/[^a-zA-Z0-9_-]/g, '_').trim();
        };
        
        const sanitizedMarcaNome = sanitizeFolderName(marcaNome);
        const sanitizedModelo = sanitizeFolderName(modelo);
        
        // Criar estrutura de pastas: pictures/marca/modelo
        const baseDir = path.join(process.cwd(), 'pictures');
        const marcaDir = path.join(baseDir, sanitizedMarcaNome);
        const modeloDir = path.join(marcaDir, sanitizedModelo);

        // Criar pastas se não existirem
        if (!existsSync(baseDir)) {
            await mkdir(baseDir, { recursive: true });
        }
        if (!existsSync(marcaDir)) {
            await mkdir(marcaDir, { recursive: true });
        }
        if (!existsSync(modeloDir)) {
            await mkdir(modeloDir, { recursive: true });
        }

        // Função para sanitizar nome de arquivo (remover caracteres especiais e caminhos)
        const sanitizeFileName = (fileName) => {
            // Extrair nome e extensão
            const ext = path.extname(fileName);
            const nameWithoutExt = path.basename(fileName, ext);
            
            // Sanitizar nome (remover caracteres especiais, manter apenas alfanuméricos, hífen e underscore)
            const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').trim();
            
            // Se o nome ficou vazio, usar um nome padrão
            const finalName = sanitizedName || 'foto';
            
            // Retornar com extensão .jpg (já que convertemos para JPEG)
            return `${finalName}.jpg`;
        };

        const uploadedFiles = [];
        let successCount = 0;

        // Processar cada foto
        for (const photo of photos) {
            if (!photo || typeof photo === 'string') continue;

            const bytes = await photo.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Redimensionar e otimizar a imagem para 427x320px (proporção 4:3)
            const resizedBuffer = await sharp(buffer)
                .resize(427, 320, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 85 })
                .toBuffer();

            // Usar o nome original do arquivo (sanitizado) - sobrescreve se já existir
            const filename = sanitizeFileName(photo.name);
            const filepath = path.join(modeloDir, filename);
            const fotoPath = `/pictures/${sanitizedMarcaNome}/${sanitizedModelo}/${filename}`;

            // Salvar arquivo redimensionado
            await writeFile(filepath, resizedBuffer);

            // Criar ou atualizar entrada na tabela Fotos
            // Se a foto já existir (mesmo foto_path), apenas atualiza o arquivo físico
            await dbPool.query(
                `INSERT INTO motos.Fotos (foto_path, descricao) 
                 VALUES (?, NULL)
                 ON DUPLICATE KEY UPDATE foto_path = foto_path`,
                [fotoPath]
            );

            uploadedFiles.push({
                originalName: photo.name,
                savedName: filename,
                path: `pictures/${sanitizedMarcaNome}/${sanitizedModelo}/${filename}`
            });
            successCount++;
        }

        return NextResponse.json({
            success: true,
            uploaded: successCount,
            files: uploadedFiles,
            message: `${successCount} foto(s) enviada(s) com sucesso`
        });

    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        return NextResponse.json(
            { error: 'Erro ao processar upload de fotos', details: error.message },
            { status: 500 }
        );
    }
}

