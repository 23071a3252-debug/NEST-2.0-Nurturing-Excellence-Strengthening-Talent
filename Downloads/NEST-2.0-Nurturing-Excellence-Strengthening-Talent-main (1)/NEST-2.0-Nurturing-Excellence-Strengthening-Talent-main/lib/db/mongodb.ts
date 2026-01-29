/**
 * MongoDB connection utility with connection pooling
 */

import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please define MONGODB_DB environment variable');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

// Cached connection to avoid reconnecting on hot reload
let cachedConnection: MongoConnection | null = null;

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cachedConnection) {
    return cachedConnection;
  }

  const client = new MongoClient(uri);
  
  await client.connect();
  const db = client.db(dbName);

  cachedConnection = { client, db };

  return cachedConnection;
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function closeConnection(): Promise<void> {
  if (cachedConnection) {
    await cachedConnection.client.close();
    cachedConnection = null;
  }
}
