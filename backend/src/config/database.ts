import mongoose from 'mongoose';
import { env } from './environment';

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('connected', () => {
    // eslint-disable-next-line no-console
    console.log(`[database] MongoDB connected: ${mongoose.connection.host}`);
  });
  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[database] MongoDB connection error:', err);
  });

  await mongoose.connect(env.MONGO_URI);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}