<<<<<<< HEAD
import { MongoClient } from 'mongodb'

let cachedClient = null
let cachedDb = null

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(process.env.MONGODB_URI, options)
  await client.connect()
  
  const db = client.db(process.env.MONGODB_DB || 'VidhikGuru')
  
  cachedClient = client
  cachedDb = db
  
  return { client, db }
}
=======
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
>>>>>>> 4499e96ea140dbe1191ea8ea597c1a4275f3ef79
