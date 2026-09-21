import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: 'postgres://postgres:Emi15082005@localhost:5432/scorelift' })

const result = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")
console.log('Tables:', result.rows.map(r => r.tablename).join('\n'))

// Also check if user exists
const userResult = await pool.query("SELECT email, email_verified, onboarding_complete FROM \"user\" WHERE email = 'ayewealth11@gmail.com'")
console.log('\nUser check:', JSON.stringify(userResult.rows, null, 2))

await pool.end()