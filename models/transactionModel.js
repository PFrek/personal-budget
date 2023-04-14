const { pool } = require('./index');
const { transfer } = require('./envelopeModel');

const getAll = async () => {
  try {
    const sql = 'SELECT * FROM transactions ORDER BY timestamp DESC';
    return (await pool.query(sql)).rows;
  } catch (error) {
    throw new Error('An error occurred while running Transaction.getAll query.' + error.message, { originalError: error });
  }
};

const findId = async (id) => {
  try {
    const sql = 'SELECT * FROM transactions WHERE id = $1';
    const values = [id];
    return (await pool.query(sql, values)).rows;
  } catch (error) {
    throw new Error('An error occurred while running Transaction.findId query.' + error.message, { originalError: error });
  }
};

const create = async (transaction) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await transfer(client, transaction);

    const sql = 'INSERT INTO transactions (timestamp, amount, recipient_id, payer_id) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [transaction.timestamp, transaction.amount, transaction.recipient_id, transaction.payer_id];
    const rows = (await pool.query(sql, values)).rows;

    await client.query('COMMIT');
    return rows;
  } catch (error) {
    throw new Error('An error occurred while running Transaction.create query.' + error.message, { originalError: error });
  } finally {
    client.release();
  }
};

const update = (id, newTransaction) => {
  return pool.query(
    'UPDATE transactions SET timestamp = $1, amount = $2, recipient_id = $3, payer_id = $4 WHERE id = $5 RETURNING *',
    [newTransaction.timestamp, newTransaction.amount, newTransaction.recipient_id, newTransaction.payer_id, id]
  ).then((result) => {
    return result.rows[0];
  }).catch((error) => {
    throw error;
  });
};

const remove = async (transaction) => {
  // Reverse the transaction
  [transaction.payer_id, transaction.recipient_id] = [transaction.recipient_id, transaction.payer_id];

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await transfer(client, transaction);

    const sql = 'DELETE FROM transactions WHERE id = $1';
    const values = [transaction.id];
    await pool.query(sql, values);

    await client.query('COMMIT');
  } catch (error) {
    throw new Error('An error occurred while running Transaction.remove query.' + error.message, { originalError: error });
  } finally {
    client.release();
  }
};


module.exports = {
  getAll,
  create,
  findId,
  update,
  remove,
}