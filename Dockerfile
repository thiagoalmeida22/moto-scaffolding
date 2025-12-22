# Dockerfile seguro para Next.js
# Multi-stage build para otimizar o tamanho da imagem final

# Stage 1: Build da aplicação
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências primeiro (cache layer)
COPY package.json package-lock.json ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copia o resto dos arquivos da aplicação
COPY . .

# Gera o build de produção do Next.js
RUN npm run build

# Stage 2: Imagem de produção
FROM node:20-alpine AS runner

# Instala curl para healthcheck
RUN apk add --no-cache curl

# Cria um usuário do sistema chamado 'nextjs' (não-root)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Define o diretório de trabalho
WORKDIR /app

# Define variável de ambiente para produção
ENV NODE_ENV=production

# Copia apenas os arquivos necessários do stage de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Altera a propriedade dos arquivos para o usuário nextjs
RUN chown -R nextjs:nodejs /app

# Altera para o usuário não-root
USER nextjs

# Expõe a porta usada pela aplicação
EXPOSE 3000

# Define variável de ambiente para a porta
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar a aplicação
CMD ["node", "server.js"]

