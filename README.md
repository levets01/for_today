# API de solicitudes comerciales

API REST en NestJS para gestionar solicitudes comerciales con TypeORM + SQLite, validación de DTOs, Swagger y protección por `x-api-key` + `x-user`.

## Requisitos

- Node.js 18 o superior
- npm
- Docker y Docker Compose (opcional)

## 1) Instalar dependencias

```bash
npm install
```

## 2) Configurar variables de entorno

```env
PORT=3010
API_KEYS=key1,key2
SQLITE_DB=./data/sqlite.db
NODE_ENV=production
```

## 3) Ejecutar el proyecto

```bash
npm run build
API_KEYS=key1,key2 SQLITE_DB=./data/sqlite.db PORT=3010 node dist/main
```

Con Docker:

```bash
mkdir -p ./data
sudo docker compose up --build
```

API: `http://localhost:3010`
Swagger: `http://localhost:3010/docs`

## 4) Base de datos

La aplicación usa SQLite mediante TypeORM. El esquema se sincroniza automáticamente al iniciar (`synchronize: true`), incluyendo las tablas `solicitudes` y `solicitud_historial`, índices por estado, asesor asignado y fecha de creación, y el campo `version` para control de concurrencia. La base de datos se guarda en `./data/sqlite.db`.

## 5) Endpoints principales

- `POST /solicitudes`: crear solicitud. Estado inicial `PENDIENTE`.
- `GET /solicitudes`: consultar con filtros y paginación.
- `GET /solicitudes/:id`: consultar detalle.
- `PATCH /solicitudes/:id/estado`: cambiar estado enviando `versionEsperada`.
- `PATCH /solicitudes/:id/asignacion`: asignar o reasignar a un asesor (`admin` o `supervisor`).
- `GET /solicitudes/:id/historial`: consultar trazabilidad.

Filtros disponibles en `GET /solicitudes`: `estado`, `asesor`, `cliente`, `desde`, `hasta`, `page` y `limit` (máximo 100).

## 6) Ejemplos curl

```bash
curl -X GET http://localhost:3010/solicitudes \
  -H "x-api-key: key1" \
  -H "x-user: asesor1"

curl -X POST http://localhost:3010/solicitudes \
  -H "x-api-key: key1" \
  -H "x-user: asesor1" \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Empresa ABC","descripcion":"Solicitud de seguimiento comercial"}'

curl -X PATCH http://localhost:3010/solicitudes/1/estado \
  -H "x-api-key: key1" \
  -H "x-user: asesor1" \
  -H "Content-Type: application/json" \
  -d '{"estado":"EN_GESTION","versionEsperada":1}'

curl -X PATCH http://localhost:3010/solicitudes/1/asignacion \
  -H "x-api-key: key1" \
  -H "x-user: supervisor" \
  -H "Content-Type: application/json" \
  -d '{"asesorId":"asesor2"}'

curl -X GET http://localhost:3010/solicitudes/1/historial \
  -H "x-api-key: key1" \
  -H "x-user: supervisor"
```

## 7) Usuarios válidos

- `admin`
- `supervisor`
- `asesor1`
- `asesor2`

## 8) Seguridad

Todos los endpoints requieren `x-api-key` válido y `x-user` válido. Los errores se devuelven con el formato uniforme del `HttpExceptionFilter`.

## 9) Decisiones técnicas

- Se conserva una única base SQLite y TypeORM; el historial se relaciona con la solicitud mediante `solicitudId`.
- La paginación se ejecuta en base de datos con límites validados por DTO.
- Las restricciones de acceso se aplican en la consulta TypeORM, no después de recuperar los registros.
- Los cambios de estado incluyen control optimista por `version` y control de versiones en la misma transacción que registra el historial.
- Las asignaciones no modifican el estado automáticamente.
- Se normalizan los campos de texto y se rechazan cadenas compuestas solo por espacios.

## 10) Tests

```bash
npm run test
```
