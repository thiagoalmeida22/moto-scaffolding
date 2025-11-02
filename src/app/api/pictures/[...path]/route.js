import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(request, { params }) {
    try {
        const { path: filePath } = await params;
        const filePathArray = Array.isArray(filePath) ? filePath : [filePath];
        const relativePath = filePathArray.join('/');
        
        // Construir caminho completo do arquivo
        const fullPath = path.join(process.cwd(), 'pictures', relativePath);
        
        // Verificar se o arquivo existe
        if (!existsSync(fullPath)) {
            return NextResponse.json(
                { error: 'Arquivo não encontrado' },
                { status: 404 }
            );
        }
        
        // Ler o arquivo
        const fileBuffer = await readFile(fullPath);
        
        // Determinar o tipo MIME baseado na extensão
        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
        
    } catch (error) {
        console.error('Erro ao servir imagem:', error);
        return NextResponse.json(
            { error: 'Erro ao servir imagem' },
            { status: 500 }
        );
    }
}

