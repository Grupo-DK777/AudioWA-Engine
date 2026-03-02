import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

console.log('--- Diagnóstico de Redis ---');
console.log(`Intentando conectar a: ${redisUrl}`);

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('❌ No se pudo conectar a Redis después de 3 intentos.');
      return null;
    }
    return 200;
  }
});

redis.on('connect', () => {
  console.log('✅ Conexión a Redis exitosa!');
});

redis.on('ready', async () => {
  console.log('✅ Redis está listo para recibir comandos.');
  try {
    await redis.set('test-key', 'working');
    const value = await redis.get('test-key');
    console.log(`✅ Prueba de Escritura/Lectura: ${value === 'working' ? 'ÉXITO' : 'FALLO'}`);
    await redis.del('test-key');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error operando en Redis:', err);
    process.exit(1);
  }
});

redis.on('error', (err) => {
  console.error('❌ Error de conexión Redis:', err.message);
});
