module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: '127.0.0.1',
          port: 5432,
          user: 'your_db_user',
          password: 'your_db_pass',
          database: 'your_db_name'
        },
    migrations: { directory: './migrations' },
    pool: { min: 2, max: 10 }
  },

  production: {
    client: 'pg',
    connection: { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } },
    migrations: { directory: './migrations' },
    pool: { min: 2, max: 10 }
  }
};