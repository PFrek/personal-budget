const Pool = require('pg').Pool;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432
});

const getAll = () => {
  return pool.query('SELECT * FROM envelopes ORDER BY id ASC')
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw error;
  });
};

const findId = (id) => {
  return pool.query('SELECT * FROM envelopes WHERE id = $1', [id])
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw error;
  });
};

const createEnvelope = (envelope) => {
  if(!envelope) {
    throw new Error("Envelope must not be empty.");
  }

  const title = envelope.title;
  if(!title || typeof(title) !== "string") {
    throw new Error("Title of envelope must be a valid string.");
  }

  const budget = envelope.budget;
  if(!budget || typeof(budget) !== "number") {
    throw new Error("Budget of envelope must be a valid number.");
  }

  return pool.query('INSERT INTO envelopes (title, budget) VALUES ($1, $2) RETURNING *', [title, budget])
    .then((result) => {
      return result.rows[0];
    })
    .catch((error) => {
      throw error;
  });
};

const update = (id, newEnvelope) => {
  return pool.query(
    'UPDATE envelopes SET title = $1, budget = $2 WHERE id = $3 RETURNING *',
    [newEnvelope.title, newEnvelope.budget, id]
  ).then((result) => {
    return result.rows[0];
  }).catch((error) => {
    throw error;
  });
};

const remove = (id) => {
  pool.query('DELETE FROM envelopes WHERE id = $1', [id])
    .catch((error) => {
      throw error;
  });
}


module.exports = {
  getAll,
  createEnvelope,
  findId,
  update,
  remove
};