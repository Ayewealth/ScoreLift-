import postgres from 'postgres'

const sql = postgres('postgres://postgres:Emi15082005@localhost:5432/scorelift')

// Check if user exists
const existing = await sql`SELECT email, email_verified, onboarding_complete FROM "user" WHERE email = ${'ayewealth11@gmail.com'}`
console.log('Existing user:', existing)

if (existing.length === 0) {
  console.log('User not found — needs signup first')
} else {
  // Check if onboarding is complete
  const user = existing[0]
  if (!user.onboarding_complete) {
    console.log('Setting onboarding_complete = true')
    await sql`UPDATE "user" SET onboarding_complete = true WHERE email = ${'ayewealth11@gmail.com'}`
  } else {
    console.log('Onboarding already complete')
  }
  
  // Verify email is set
  if (!user.email_verified) {
    console.log('Setting email_verified = true')
    await sql`UPDATE "user" SET email_verified = true WHERE email = ${'ayewealth11@gmail.com'}`
  } else {
    console.log('Email already verified')
  }
  
  // Also check user table structure
  const columns = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'user' 
    ORDER BY ordinal_position
  `
  console.log('User columns:', columns.map(c => c.column_name).join(', '))
}

await sql.end()