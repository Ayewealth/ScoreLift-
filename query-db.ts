import { db } from './server/src/db/client'

async function main() {
  await db.execute(`DELETE FROM "user" WHERE email LIKE 'test%' OR email LIKE 'flow%' OR email LIKE 'debug%'`)
  const users = await db.select().from({ email: 'test@dummy.com', id: 'dummy', emailVerified: false })
  console.log('done')
}
main()