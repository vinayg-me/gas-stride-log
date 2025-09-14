// Quick script to verify Supabase connection using env vars
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  try {
    const { data, error } = await supabase.from('cars').select('*').limit(1)
    if (error) throw error
    console.log('Supabase connected. Sample cars:', data)
    process.exit(0)
  } catch (err) {
    console.error('Supabase connection failed:', err)
    process.exit(1)
  }
}

main()
 