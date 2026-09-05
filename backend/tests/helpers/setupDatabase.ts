import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let server: MongoMemoryServer | null = null;
let connected = false;

let setupPromise: Promise<void> | null = null;

export function setupDatabase(): Promise<void> {
  if (!setupPromise) {
    setupPromise = (async () => {
      if (!connected) {
        server = await MongoMemoryServer.create();
        process.env.MONGO_URI = server.getUri();
        await mongoose.connect(server.getUri());
        connected = true;
      }
    })();
  }
  return setupPromise;
}

export async function teardownDatabase(): Promise<void> {
  if (connected) {
    await mongoose.disconnect();
    if (server) await server.stop();
    connected = false;
    server = null;
  }
  setupPromise = null;
}

export async function cleanCollections(collections: string[]): Promise<void> {
  await Promise.all(
    collections.map((name) =>
      mongoose.connection.collection(name).deleteMany({})
    )
  );
}