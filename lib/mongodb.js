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