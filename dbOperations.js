import mysql from 'mysql2/promise';
import sql from 'mssql';
import fs from 'fs/promises';
import { mysqlConfig, sqlServerConfig } from './config.js';

export async function storeInMySQL(pk, imagePath) {
  const connection = await mysql.createConnection(mysqlConfig);
  try {
    await connection.execute('INSERT INTO your_table (pk, image) VALUES (?, ?)', [pk, imagePath]);
    console.log('Data stored in MySQL successfully');
  } finally {
    await connection.end();
  }
}

export async function retrieveFromMySQL() {
  const connection = await mysql.createConnection(mysqlConfig);
  try {
    const [rows] = await connection.execute('SELECT pk, image FROM your_table');
    return rows;
  } finally {
    await connection.end();
  }
}

export async function saveAsJSON(data, filePath) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log('Data saved as JSON successfully');
}

export async function readJSONFile(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

export async function pushToSQLServer(data) {
  try {
    await sql.connect(sqlServerConfig);
    for (const item of data) {
      await sql.query`INSERT INTO your_table (pk, image) VALUES (${item.pk}, ${item.image})`;
    }
    console.log('Data pushed to SQL Server successfully');
  } finally {
    await sql.close();
  }
}

