const Pool = require('pg').Pool;

console.log("Initializing Database");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432
});


pool.query(
  `CREATE TABLE IF NOT EXISTS envelopes (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    budget money NOT NULL
  );`,
  (error) => {
    if(error) {
      throw error;
    }
    console.log('Envelopes table initialized');
});

pool.query(
  `CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    date date NOT NULL,
    amount money NOT NULL,
    recipient_id INTEGER REFERENCES envelopes(id),
    payer_id INTEGER REFERENCES envelopes(id)
  );`,
  (error) => {
    if(error) {
      throw error;
    }
    console.log('Transactions table initialized');
});

module.exports = { pool };