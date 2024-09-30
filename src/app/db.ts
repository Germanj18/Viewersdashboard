import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL || "postgres://default:SbPtsfC23mND@ep-muddy-rain-a4kexquv-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
});

export default pool;