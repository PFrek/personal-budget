const { pool } = require('./index');

const getAll = async () => {
  try {
    const sql = 'SELECT * FROM envelopes ORDER BY id ASC';
    return (await pool.query(sql)).rows;
  }
  catch (error) {
    throw new Error('An error occurred while running Envelope.getAll query:\n' + error.message, { originalError: error });
  }
};

const findId = async (id) => {
  try {
    const sql = 'SELECT * FROM envelopes WHERE id = $1';
    const values = [id];
    return (await pool.query(sql, values)).rows;
  }
  catch (error) {
    throw new Error('An error occurred while running Envelope.findId query.' + error.message, { originalError: error });
  }
};

const create = async (envelope) => {
  try {
    const sql = 'INSERT INTO envelopes (title, budget) VALUES ($1, $2) RETURNING *';
    const values = [envelope.title, envelope.budget];
    return (await pool.query(sql, values)).rows;
  }
  catch (error) {
    throw new Error('An error occurred while running Envelope.createEnvelope query.' + error.message, { originalError: error });
  }
};

const update = async (id, newEnvelope) => {
  try {
    const sql = 'UPDATE envelopes SET title = $1, budget = $2 WHERE id = $3 RETURNING *';
    const values = [newEnvelope.title, newEnvelope.budget, id];
    return (await pool.query(sql, values)).rows;
  }
  catch (error) {
    throw new Error('An error occurred while running Envelope.update query.' + error.message, { originalError: error });
  }
};

const remove = async (id) => {
  try {
    const sql = 'DELETE FROM envelopes WHERE id = $1';
    const values = [id];
    await pool.query(sql, values);
  }
  catch (error) {
    throw new Error('An error occurred while running Envelope.remove query: ' + error.message, { originalError: error });
  }
};

const transfer = async (client, transaction) => {
  try {
    // Subtract from payer
    await client.query("UPDATE envelopes SET budget = budget - $1::money WHERE id = $2",
      [transaction.amount, transaction.payer_id]);

    // Add to receiver
    await client.query("UPDATE envelopes SET budget = budget + $1::money WHERE id = $2",
      [transaction.amount, transaction.recipient_id])

  } catch (error) {
    throw new Error('Failed to transfer between envelopes: ' + error.message, { originalError: error });
  }
}

// Replace transfer
const replaceTransfer = async (oldTransaction, newTransaction) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Undo old transaction
    await client.query("UPDATE envelopes SET budget = budget - $1 WHERE id = $2",
      [oldTransaction.amount, oldTransaction.recipient_id]);

    await client.query("UPDATE envelopes SET budget = budget + $1 WHERE id = $2",
      [oldTransaction.amount, oldTransaction.payer_id]);

    // Do new transaction
    // Subtract from payer
    await client.query("UPDATE envelopes SET budget = budget - $1 WHERE id = $2",
      [newTransaction.amount, newTransaction.payer_id]);

    // Add to receiver
    await client.query("UPDATE envelopes SET budget = budget + $1 WHERE id = $2",
      [newTransaction.amount, newTransaction.recipient_id]);

  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}


module.exports = {
  getAll,
  create: create,
  findId,
  update,
  remove,
  transfer,
  replaceTransfer,
};