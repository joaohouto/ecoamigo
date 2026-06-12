import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = 'ecoamigo'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
}

export async function conectarMongoDB(): Promise<Db> {
  if (!uri) throw new Error('MONGODB_URI não configurado')

  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri)
    await global._mongoClient.connect()
  }

  return global._mongoClient.db(dbName)
}
