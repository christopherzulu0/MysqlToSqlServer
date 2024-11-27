export const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT
};

export const sqlServerConfig = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_SERVER,
  database: process.env.SQLSERVER_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT, 10) : undefined
};

// Validate SQL Server configuration
if (!sqlServerConfig.user || !sqlServerConfig.password || !sqlServerConfig.server || !sqlServerConfig.database) {
  throw new Error('Missing SQL Server configuration. Please check your .env.local file.');
}

if (sqlServerConfig.port && isNaN(sqlServerConfig.port)) {
  throw new Error('Invalid SQL Server port. Please ensure SQLSERVER_PORT is a valid number.');
}