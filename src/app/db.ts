const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: "postgres://default:SbPtsfC23mND@ep-muddy-rain-a4kexquv-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require?sslmode=require",
})