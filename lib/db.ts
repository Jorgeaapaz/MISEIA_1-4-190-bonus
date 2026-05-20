import { MongoClient, Db, Document } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGODB_DB || 'bonos_db'

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (db) return db

  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }

  db = client.db(dbName)
  return db
}

export async function getCollection<T extends Document>(name: string) {
  const database = await getDb()
  return database.collection<T>(name)
}
