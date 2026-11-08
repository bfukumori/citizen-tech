# ==============================================================================
# FIAP GRADUAÇÃO — GLOBAL SOLUTION 2026/2 · CITIZENTECH
# ÁREA 4: DEVOPS, SEGURANÇA E QUALIDADE
# Dockerfile Multi-Stage Otimizado para Next.js 16 + TypeScript
# ==============================================================================

# Estágio 1: Dependências base
FROM node:26-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

# Estágio 2: Build da aplicação
FROM node:26-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm run build

# Estágio 3: Runner de Produção (Imagem Mínima e Segura)
FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Cria usuário não-root por boas práticas de segurança (SecOps)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dev.db* ./

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
