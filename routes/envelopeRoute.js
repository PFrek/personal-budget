const Router = require('express-promise-router');
const envelopeRouter = Router();

const currency = require('currency.js');

const Envelope = require('../models/envelopeModel');

// Id Param
envelopeRouter.param('id', async (req, res, next, id) => {
  if (!/^-?\d+$/.test(id)) {
    return res.status(400).send({ message: "id parameter must be an integer" });
  }

  try {
    const rows = await Envelope.findId(id);

    if (rows.length === 0) {
      return res.sendStatus(404);
    }

    req.foundEnvelope = rows[0];
    next();
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Failed to retrieve an envelope by id.',
      error: error
    });
  }
});

// Validate request body envelope
const validateBodyEnvelope = (req, res, next) => {
  const envelope = req.body;

  if (!envelope) {
    res.status(400).send({ message: "Request body must contain valid envelope object." });
  }

  const title = envelope.title;
  if (!title || typeof (title) !== "string") {
    res.status(400).send({ message: "Request envelope must contain a valid title." });
  }

  const budget = currency(envelope.budget);
  if(!envelope.budget || typeof(envelope.budget) !== "string" || budget.intValue <= 0) {
    return res.status(400).send({ message: "Request transaction must contain a valid positive amount." });
  }

  req.bodyEnvelope = {
    title: title,
    budget: budget
  };

  next();
};

// Return all envelopes
envelopeRouter.get('/', async (req, res, next) => {
  try {
    const envelopes = await Envelope.getAll();
    res.send({ envelopes: envelopes });
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Failed to retrieve all envelopes.",
      error: error
    });
  }
});

// Return specific envelope
envelopeRouter.get('/:id', (req, res, next) => {
  res.send({ envelope: req.foundEnvelope });
});

// Create a new envelope
envelopeRouter.post('/', validateBodyEnvelope, async (req, res, next) => {
  try {
    const createdEnvelope = await Envelope.create(req.bodyEnvelope);
    res.status(201).send({ envelope: createdEnvelope });
  } 
  catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Failed to create a new envelope.",
      error: error
    });  
  }
});

// Spend amount from envelope
envelopeRouter.put('/:id/spend', async (req, res, next) => {
  const amountQuery = req.query.amount;

  if(!amountQuery) {
    return res.status(400).send({ message: "Must specify amount to spend in 'amount' query parameter." });
  }

  const newBudget = currency(req.foundEnvelope.budget) - currency(amountQuery);

  if (newBudget < 0) {
    return res.status(400).send({ message: "Spending cannot exceed envelope budget." });
  }

  req.foundEnvelope.budget = newBudget;

  try {
    const updatedEnvelope = await Envelope.update(req.foundEnvelope.id, req.foundEnvelope);
    res.send({ envelope: updatedEnvelope });
  } catch(error) {
    res.status(500).send({
      message: "Failed to spend amount from envelope.",
      error: error
    });
  }
})

// Update an envelope
envelopeRouter.put('/:id', validateBodyEnvelope, async (req, res, next) => {
  try {
    const updatedEnvelope = await Envelope.update(req.foundEnvelope.id, req.bodyEnvelope);

    res.send({ envelope: updatedEnvelope });
  } catch(error) {
    res.status(500).send({
      message: "Failed to edit an envelope.",
      error: error
    });
  }
});

// Delete an envelope
envelopeRouter.delete('/:id', async (req, res, next) => {
  try {
    await Envelope.remove(req.foundEnvelope.id);

    res.sendStatus(204);
  } catch(error) {
    res.status(500).send({
      message: "Failed to delete an envelope.",
      error: error
    });
  }
});

module.exports = { envelopeRouter };