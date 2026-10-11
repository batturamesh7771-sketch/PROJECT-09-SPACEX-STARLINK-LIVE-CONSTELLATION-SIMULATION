import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cosmos',
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    logger.info('Database schema initialized successfully.');
  } catch (error) {
    logger.error('Failed to initialize database schema:', error);
    throw error;
  }
};
