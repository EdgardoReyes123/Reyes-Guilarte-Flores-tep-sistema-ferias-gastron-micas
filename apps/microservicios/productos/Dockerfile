# ==============================
# ETAPA 1: CONSTRUCCIÓN (BUILDER)
# ==============================
FROM node:18 AS builder

WORKDIR /app

# 1. Copiar archivos de configuración de dependencias
COPY package*.json ./
COPY apps/microservicios/productos/package*.json ./products/

# 2. Instalar TODAS las dependencias (incluye devDependencies para build)
RUN npm ci

# 3. Copiar todo el código fuente
COPY . .

# 4. Build específico del microservicio productos
RUN npm run build productos

# ==============================
# ETAPA 2: PRODUCCIÓN
# ==============================
FROM node:18-slim AS production

WORKDIR /app

# 1. Copiar archivos de configuración de producción
COPY package*.json ./

# 2. Instalar SOLO dependencias de producción
RUN npm ci --only=production

# 3. Copiar el build compilado desde la etapa builder
COPY --from=builder /app/dist/productos ./dist/productos

# 4. Copiar node_modules si hay problemas
COPY --from=builder /app/node_modules ./node_modules

# 5. Crear usuario no-root para seguridad
RUN useradd -m -u 1001 appuser
USER appuser

# 6. Variables de entorno
ENV NODE_ENV=production
ENV PORT=3004

# 7. Exponer puerto TCP del microservicio
EXPOSE 3004

# 8. Comando de inicio
CMD ["node", "dist/productos/src/main.js"]