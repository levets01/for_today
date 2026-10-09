# API de solicitudes comerciales

API REST en NestJS para gestionar solicitudes comerciales con TypeORM + SQLite, validación de DTOs, Swagger y protección por `x-api-key` + `x-user`.

## Requisitos

- Node.js 18 o superior
- npm
- Docker y Docker Compose (opcional, recomendado si quieres evitar problemas de compilación nativa de sqlite3)

## 1) Instalar dependencias

```bash
npm install
```

## 2) Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con este contenido:

```env
PORT=3010
API_KEYS=key1,key2
SQLITE_DB=./data/sqlite.db
NODE_ENV=production
```

Importante:
- `API_KEYS` son las claves válidas para la API. Todas las peticiones deben enviar una de esas claves en el header `x-api-key`.
- `x-user` NO se configura en `.env`; debe enviarse por request y debe ser uno de estos usuarios válidos del servidor:
  - `admin`
  - `supervisor`
  - `asesor1`
  - `asesor2`

## 3) Ejecutar el proyecto

### Opción A: Localmente

```bash
npm run build
API_KEYS=key1,key2 SQLITE_DB=./data/sqlite.db PORT=3010 node dist/main
```

### Opción B: Con Docker (recomendado)

```bash
mkdir -p ./data
sudo docker compose up --build
```

La API quedará disponible en:

```text
http://localhost:3010
```

Swagger quedará disponible en:

```text
http://localhost:3010/docs
```

## 4) Paso a paso para usar Swagger

1. Abre la URL:
   ```text
   http://localhost:3010/docs
   ```
2. En la esquina superior derecha verás el botón `Authorize`.
3. Pulsa `Authorize`.
4. En el cuadro de diálogo introduce:
   - `x-api-key: key1`
   - `x-user: asesor1`
5. Pulsa `Authorize` / `Close`.
6. A partir de ahí, Swagger enviará automáticamente esos dos headers en cada petición protegida.
7. Prueba cualquier endpoint de `solicitudes`.

Ejemplo válido en Swagger:
- `x-api-key: key1`
- `x-user: asesor1`

## 5) Casos útiles

### GET /solicitudes

```bash
curl -X GET http://localhost:3010/solicitudes \
  -H "x-api-key: key1" \
  -H "x-user: asesor1"
```

### POST /solicitudes

```bash
curl -X POST http://localhost:3010/solicitudes \
  -H "x-api-key: key1" \
  -H "x-user: asesor1" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Empresa ABC",
    "descripcion": "Solicitud de seguimiento comercial"
  }'
```

### PATCH /solicitudes/:id/estado

```bash
curl -X PATCH http://localhost:3010/solicitudes/1/estado \
  -H "x-api-key: key1" \
  -H "x-user: asesor1" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "EN_GESTION"
  }'
```

## 6) Usuarios válidos

Los usuarios definidos en memoria son:

- `admin`
- `supervisor`
- `asesor1`
- `asesor2`

## 7) Seguridad

Todos los endpoints funcionales requieren:
- `x-api-key` válido
- `x-user` válido

Si falta cualquiera de los dos, la API devuelve `401` con un error normalizado.

## 8) Tests

```bash
npm run test
```

## 9) Base de datos

La app usa SQLite. La base de datos se guarda en:

```text
./data/sqlite.db
```

Con Docker, esa carpeta queda persistida en el host para que no se pierda al reiniciar el contenedor.
