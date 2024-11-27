import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env.local') });

const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT
};

async function createTable() {
  let connection;
  try {
    connection = await mysql.createConnection(mysqlConfig);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS your_table (
        pk INT PRIMARY KEY,
        image VARCHAR(1000) NOT NULL
      )
    `);
    
    console.log('Table "your_table" created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    if (connection) await connection.end();
  }
}

createTable();

