import postgres from 'postgres'
import { config } from 'dotenv';
config();

const connectionString = process.env.SUPABASE_URL
const sql = postgres(connectionString)

export default sql