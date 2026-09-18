import './dotenv/config'
import { db } from './server/src/db/client'

async function main() {
  await db.execute(`DELETE FROM "user" WHERE email LIKE 'test%' OR email LIKE 'flow%' OR email LIKE 'debug%'`)
  const users = await db.execute(`SELECT id, email, email_verified FROM "user"`)
  console.log(JSON.stringify(users, null, 2))
}
main()