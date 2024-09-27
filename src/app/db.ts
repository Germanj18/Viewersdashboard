import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lacasa',
  password: 'xforce',
  port: 5432,
});

export default pool;