import { db } from './server/src/db/client'
import { verification } from './shared/schema'
const result = await db.select({ identifier: verification.identifier, value: verification.value, expiresAt: verification.expiresAt }).from(verification).limit(5)
console.log(JSON.stringify(result, null, 2))