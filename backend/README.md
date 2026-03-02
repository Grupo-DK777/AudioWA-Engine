# AudioWA-Engine

Backend en Node.js para recibir audios reenviados desde WhatsApp, procesarlos en segundo plano con BullMQ + Redis, transcribirlos con OpenAI Speech-to-Text y guardar resultados en PostgreSQL usando Prisma.

## Stack

- Node.js 18+
- Express
- PostgreSQL
- Prisma ORM
- Multer
- OpenAI API (transcripción + traducción opcional)
- BullMQ + Redis (procesamiento asíncrono)

## Estructura

```text
/src
  /controllers
      transcription.controller.js
  /services
      transcription.service.js
      translation.service.js
  /routes
      transcription.routes.js
  /middlewares
      upload.middleware.js
      error.middleware.js
  /config
      prisma.js
      env.js
  /queues
      transcription.queue.js
  /workers
      transcription.worker.js
  /utils
      logger.js
  server.js
/prisma
  schema.prisma
```

## Modelo Prisma

`Transcription` incluye:

- `id` (uuid)
- `originalFilename`
- `detectedLanguage`
- `transcriptionText`
- `translatedText` (nullable)
- `durationSeconds`
- `status` (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`)
- `createdAt`

Adicionalmente se guardan metadatos útiles para operación (`storedFilename`, `targetLanguage`, `errorMessage`).

## Variables de entorno

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Ajusta como mínimo:
- `OPENAI_API_KEY` (Requerido para transcripción)
- `DATABASE_URL`
- `REDIS_URL`

## Ejecución local (sin Docker)

1. Instalar dependencias:
```bash
npm install
```

2. Levantar PostgreSQL y Redis (por Docker o servicios locales).

3. Ejecutar migraciones y generar cliente Prisma:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Iniciar servidor:
```bash
npm run dev
```

Servidor en `http://localhost:3000`.

## Ejecución con Docker Compose

1. Crear `.env` desde ejemplo.
2. Levantar todo:
```bash
docker compose up --build
```

Esto inicia:
- `app` (API Express)
- `postgres`
- `redis`

## Endpoints

### `POST /api/transcribe`

Sube un audio y crea un trabajo asíncrono.

- `multipart/form-data`
- campo archivo: `audio`
- campo opcional: `targetLanguage` (ej. `en`, `es`, `pt`)

Respuesta inicial (`202 Accepted`):

```json
{
  "id": "uuid",
  "originalFilename": "audio.ogg",
  "detectedLanguage": null,
  "transcription": null,
  "translatedText": null,
  "durationSeconds": null,
  "status": "PENDING",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### `GET /api/transcriptions`

Lista transcripciones con estado.

### `GET /api/transcriptions/:id`

Retorna detalle de una transcripción específica.

## Acceso a pgAdmin

Una vez levantado el contenedor con `docker compose`, puedes acceder a pgAdmin en:

- URL: `http://localhost:5050`
- Email: `admin@admin.com`
- Password: `admin`

Para conectar al servidor de base de datos:
1. Click derecho en `Servers` -> `Register` -> `Server...`
2. En la pestaña `General`, asigna un nombre (ej. `AudioWA`).
3. En la pestaña `Connection`:
   - Host name/address: `postgres`
   - Port: `5432`
   - Maintenance database: `audiowa_engine`
   - Username: `postgres`
   - Password: `postgres`
4. Guardar.

## Integración con WhatsApp

Este sistema expone una API REST para transcribir audios. Para integrar con WhatsApp, necesitarás un bot (ej. usando `whatsapp-web.js` o Baileys) que:
1. Escuche los mensajes de audio entrantes.
2. Descargue el archivo de audio.
3. Lo envíe al endpoint `POST /api/transcribe` de este sistema.
4. Reciba el ID de la transcripción y consulte su estado hasta que esté completada.

## Flujo de procesamiento

1. API recibe audio y valida tamaño/formato.
2. Guarda archivo temporalmente en `/uploads`.
3. Crea registro en DB con estado `PENDING`.
4. Encola job en BullMQ.
5. Worker procesa:
   - `PROCESSING`
   - transcribe y detecta idioma
   - traduce opcionalmente
   - guarda resultado y marca `COMPLETED`
   - ante error marca `FAILED`
6. Archivo temporal se elimina al terminar.

## Logs básicos

Se usan logs con `pino` y `pino-http` para requests y eventos de worker.

## Notas de producción

- Configura volúmenes persistentes para PostgreSQL.
- Ajusta concurrencia del worker según CPU y cuotas de API.
- Agrega autenticación/rate-limits para endpoint público.
- Usa secrets manager para `OPENAI_API_KEY`.
