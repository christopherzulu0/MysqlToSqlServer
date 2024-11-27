import mysql from 'mysql2/promise';
import sql from 'mssql';
import { mysqlConfig, sqlServerConfig } from './config';

export async function storeInMySQL(pk: number, imagePath: string) {
  let connection;
  try {
    connection = await mysql.createConnection(mysqlConfig);
    await connection.execute('INSERT INTO your_table (pk, image) VALUES (?, ?)', [pk, imagePath]);
    console.log('Data stored in MySQL successfully');
  } catch (error) {
    console.error('Error storing data in MySQL:', error);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('Table does not exist. Please run the setup script to create the table.');
    }
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

export async function retrieveFromMySQL(page: number = 1, pageSize: number = 50, search: string = '') {
  let connection;
  try {
    connection = await mysql.createConnection(mysqlConfig);
    const offset = (page - 1) * pageSize;
    const searchQuery = search ? `WHERE pk LIKE ? OR image LIKE ?` : '';
    const searchParams = search ? [`%${search}%`, `%${search}%`] : [];
    const query = `SELECT pk, image FROM your_table ${searchQuery} LIMIT ${pageSize} OFFSET ${offset}`;
    const [rows] = await connection.execute(query, searchParams);
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM your_table ${searchQuery}`,
      searchParams
    );
    const total = (countResult as any)[0].total;
    return { data: rows, total };
  } catch (error) {
    console.error('Error retrieving data from MySQL:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function createSQLServerTableIfNotExists() {
  try {
    await sql.connect(sqlServerConfig);
    await sql.query`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='your_table' and xtype='U')
      CREATE TABLE your_table (
        pk INT PRIMARY KEY,
        image NVARCHAR(MAX) NOT NULL
      )
    `;
    console.log('SQL Server table created or already exists');
  } catch (error) {
    console.error('Error creating SQL Server table:', error);
    throw error;
  } finally {
    await sql.close();
  }
}

export async function pushToSQLServer(data: Array<{pk: number, image: string}>) {
  try {
    await createSQLServerTableIfNotExists();
    await sql.connect(sqlServerConfig);
    
    for (const item of data) {
      try {
        await sql.query`
          MERGE INTO your_table AS target
          USING (VALUES (${item.pk}, ${item.image})) AS source (pk, image)
          ON target.pk = source.pk
          WHEN MATCHED THEN
            UPDATE SET image = source.image
          WHEN NOT MATCHED THEN
            INSERT (pk, image) VALUES (source.pk, source.image);
        `;
      } catch (error) {
        console.error(`Error pushing item with pk ${item.pk}:`, error);
        throw error;
      }
    }
    
    console.log('Data pushed to SQL Server successfully');
  } catch (error) {
    console.error('Error pushing data to SQL Server:', error);
    throw error;
  } finally {
    await sql.close();
  }
}

export async function retrieveFromSQLServer(page: number = 1, pageSize: number = 50) {
  try {
    await sql.connect(sqlServerConfig);
    const offset = (page - 1) * pageSize;
    const result = await sql.query`
      SELECT pk, image
      FROM your_table
      ORDER BY pk
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY;

      SELECT COUNT(*) as total FROM your_table;
    `;
    return { data: result.recordsets[0], total: result.recordsets[1][0].total };
  } catch (error) {
    console.error('Error retrieving data from SQL Server:', error);
    throw error;
  } finally {
    await sql.close();
  }
}


