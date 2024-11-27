import { storeInMySQL, retrieveFromMySQL, saveAsJSON, readJSONFile, pushToSQLServer } from './dbOperations.js';

async function main() {
  try {
    // Store data in MySQL
    await storeInMySQL(1, '/path/to/image1.jpg');
    await storeInMySQL(2, '/path/to/image2.jpg');

    // Retrieve data from MySQL
    const mysqlData = await retrieveFromMySQL();

    // Save data as JSON
    const jsonFilePath = './data.json';
    await saveAsJSON(mysqlData, jsonFilePath);

    // Read JSON file
    const jsonData = await readJSONFile(jsonFilePath);

    // Push data to SQL Server
    await pushToSQLServer(jsonData);

    console.log('Process completed successfully');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();

