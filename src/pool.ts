import { createPool } from 'mysql2/promise'
require('dotenv').config({ path: '.env.local' })

export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SRC,
  connectionLimit: 10
})
