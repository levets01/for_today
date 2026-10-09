FROM node:20-alpine AS builder

WORKDIR /app

# instalar dependencias de sistema necesarias para compilar paquetes nativos
RUN apk add --no-cache python3 make g++

# copiar archivos de manifest y configurar dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

# copiar el resto del código y compilar
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# instalar solo dependencias de producción
COPY package*.json ./
RUN npm install --production

# copiar artefactos compilados
COPY --from=builder /app/dist ./dist

EXPOSE 3010

CMD ["node", "dist/main"]
