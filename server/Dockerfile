FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

# ── Image finale (plus légère) ──
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma      ./prisma
COPY package*.json ./

EXPOSE 3000

# Applique les migrations puis démarre
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
