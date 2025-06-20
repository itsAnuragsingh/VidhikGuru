import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
const collectionName = "constitution_embeddings";

if (!uri) throw new Error("Please set MONGODB_URI in your .env file");

let cachedClient = null;

export async function connectToMongoDB() {
  if (cachedClient) {
    return cachedClient.db(dbName).collection(collectionName);
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;

  const db = client.db(dbName);
  return db.collection(collectionName);
}
