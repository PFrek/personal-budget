const {pool} = require('./index');

const getAll = async () => {
  try {
    const sql = 'SELECT * FROM envelopes ORDER BY id ASC';
    return (await pool.query(sql)).rows;
  } 
  catch (err) {
    console.log('An error occurred while running Envelope.getAll query.');
    throw err;
  }
};

const findId = async (id) => {
  try {
    const sql = 'SELECT * FROM envelopes WHERE id = $1';
    const values = [id];
    return (await pool.query(sql, values)).rows;
  } 
  catch (error) {
    console.log('An error occurred while running Envelope.findId query.');
    throw error;
  }
};

const create = async (envelope) => {
  try {
    const sql = 'INSERT INTO envelopes (title, budget) VALUES ($1, $2) RETURNING *';
    const values = [envelope.title, envelope.budget];
    return (await pool.query(sql, values)).rows;
  } 
  catch (error) {
    console.log('An error occurred while running Envelope.createEnvelope query.');
    throw error;
  }
};

const update = async (id, newEnvelope) => {
  try {
    const sql = 'UPDATE envelopes SET title = $1, budget = $2 WHERE id = $3 RETURNING *';
    const values = [newEnvelope.title, newEnvelope.budget, id];
    return (await pool.query(sql, values)).rows;
  } 
  catch (error) {
    console.log('An error occurred while running Envelope.update query.');
    throw error;
  }
};

const remove = async (id) => {
  try {
    const sql = 'DELETE FROM envelopes WHERE id = $1';
    const values = [id];
    await pool.query(sql, values);
  } 
  catch (error) {
    console.log('An error occurred while running Envelope.remove query.');
    throw error;
  }
};

// Transfer funds with transaction
const transfer = async (transaction) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN')
      
    // Subtract from payer
    await client.query("UPDATE envelopes SET budget = budget - $1 WHERE id = $2",
        [transaction.amount, transaction.payer_id]);
  
    // Add to receiver
    await client.query("UPDATE envelopes SET budget = budget + $1 WHERE id = $2",
        [transaction.amount, transaction.recipient_id])
 
    await client.query('COMMIT');
    console.log('commit realizado');
  } catch(e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
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