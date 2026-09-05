import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/environment';

async function main(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] TaskFlow API running on http://localhost:${env.PORT}`);
    // eslint-disable-next-line no-console
    console.log(`[server] Swagger docs on http://localhost:${env.PORT}/api-docs`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] Fatal error:', err);
  process.exit(1);
});