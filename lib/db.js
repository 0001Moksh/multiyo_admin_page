import { MongoClient } from 'mongodb'

let cachedClient = null

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/')
    await client.connect()
    cachedClient = client
    console.log('Connected to MongoDB')
    return client
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export async function getDatabase() {
  const client = await connectToDatabase()
  return client.db(process.env.MONGO_DB || 'multiyo_admin')
}

export async function getBannersCollection() {
  const db = await getDatabase()
  return db.collection('banners')
}
