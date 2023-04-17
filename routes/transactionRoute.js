const Router = require('express-promise-router');
const transactionRouter = Router();

const currency = require('currency.js');

const Transaction = require('../models/transactionModel');
const Envelope = require('../models/envelopeModel');

// Id Param
transactionRouter.param('id', async (req, res, next, id) => {
  if (!/^-?\d+$/.test(id)) {
    return res.status(400).send({ message: "id parameter must be an integer" });
  }

  try {
    const rows = await Transaction.findId(id);

    if (rows.length === 0) {
      return res.sendStatus(404);
    }

    req.foundTransaction = rows[0];
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Failed to retrieve a transaction by id',
      error: error
    });
  }
});

// Validate request body transaction
const validateBodyTransaction = async (req, res, next) => {
  const transaction = req.body;

  const timestamp = transaction.timestamp;
  console.log(timestamp);
  if (!timestamp || typeof (timestamp) !== "string" || !timestamp.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.\d{3}Z$/)) {
    return res.status(400).send({ message: "Request transaction must contain a valid date." });
  }

  const amount = currency(transaction.amount);
  if (!transaction.amount || typeof (transaction.amount) !== "string" || amount.intValue <= 0) {
    return res.status(400).send({ message: "Request transaction must contain a valid positive amount." });
  }
  transaction.amount = amount;

  try {
    const recipient_id = transaction.recipient_id;
    if (!recipient_id || typeof (recipient_id) !== "number") {
      return res.status(400).send({ message: "Request transaction must contain a valid reicipient id." });
    }
  
    let rows = await Envelope.findId(recipient_id);
    if (rows.length === 0) {
      return res.status(404).send({ message: `Recipient envelope with id ${recipient_id} not found.` });
    }
    req.recipient_envelope = rows[0];
  
    const payer_id = transaction.payer_id;
    if (!payer_id || typeof (payer_id) !== "number") {
      return res.status(400).send({ message: "Request transaction must contain a valid payer id." });
    }
  
    rows = await Envelope.findId(payer_id);
    if (rows.length === 0) {
      return res.status(404).send({ message: `Payer envelope with id ${payer_id} not found.` });
    }
    req.payer_envelope = rows[0];

    req.bodyTransaction = transaction;
    next();
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Failed to retrieve envelope information for recipient or payer id.",
      error: error
    });
  }
};

// Return all transactions
transactionRouter.get('/', async (req, res, next) => {
  try {
    const transactions = await Transaction.getAll();
    res.send({ transactions: transactions });
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Failed to retrieve all transactions.",
      error: error
    });
  }
});

// Return specific transaction
transactionRouter.get('/:id', (req, res, next) => {
  res.send({ transaction: req.foundTransaction });
});

// Create a new transaction
transactionRouter.post('/', validateBodyTransaction, async (req, res, next) => {
  // Verify payer has enough budget
  if (currency(req.payer_envelope.budget).intValue < req.bodyTransaction.amount.intValue) {
    return res.status(400).send({ message: 'Insufficient budget in payer envelope.' });
  }

  try {
    const createdTransaction = await Transaction.create(req.bodyTransaction);

    res.status(201).send({ transaction: createdTransaction });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Failed to create a new transaction.",
      error: error.message
    });
  }
});

// Update a transaction
transactionRouter.put('/:id', async (req, res, next) => {
  res.status(400).send({ message: 'Transactions cannot be updated with PUT /:id. Delete the old transaction and create a new one instead.'});
});

// Delete a transaction
transactionRouter.delete('/:id', async (req, res, next) => {
  try {
    const recipient_budget = (await Envelope.findId(req.foundTransaction.recipient_id))[0].budget;

    // Verify that the transaction can be reversed
    if (currency(recipient_budget).intValue < req.foundTransaction.amount.intValue) {
      return res.status(400).send({ message: 'Insufficient budget in recipient envelope to delete transaction.' });
    }

    await Transaction.remove(req.foundTransaction);

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Failed to delete a transaction.",
      error: error.message
    });
  }
});

module.exports = { transactionRouter };